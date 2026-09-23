from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import case

from app.core.database import get_db
from app.models.user import User
from app.models.ticket import Ticket
from app.models.message import TicketMessage
from app.schemas.ticket import TicketCreate, TicketUpdate, TicketOut, TicketDetailOut
from app.schemas.message import MessageCreate, MessageOut
from app.schemas.ai import RAGSuggestionResponse
from app.api.deps import get_current_user, require_agent
from app.services.ai_service import triage_ticket
from app.services.rag_service import generate_rag_suggestion

router = APIRouter(prefix="/tickets", tags=["Tickets"])

# Priority sorting order: High first, then Medium, then Low
priority_order = case(
    (Ticket.priority == "High", 1),
    (Ticket.priority == "Medium", 2),
    (Ticket.priority == "Low", 3),
    else_=4
)


@router.post("", response_model=TicketDetailOut, status_code=status.HTTP_201_CREATED)
def create_ticket(
    ticket_in: TicketCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Customer submits a support ticket.
    Triggers the AI Triage service to classify category and priority automatically.
    """
    # 1. Trigger AI Triage
    triage_result = triage_ticket(ticket_in.title, ticket_in.description)

    # 2. Create Ticket
    ticket = Ticket(
        customer_id=current_user.id,
        title=ticket_in.title,
        description=ticket_in.description,
        category=triage_result.category,
        priority=triage_result.priority,
        status="Open"
    )
    db.add(ticket)
    db.flush()

    # 3. Add initial description as the opening message of the conversation thread
    initial_message = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=ticket_in.description,
        is_ai_suggested=False
    )
    db.add(initial_message)
    db.commit()
    db.refresh(ticket)
    return ticket


@router.get("", response_model=List[TicketOut])
def list_tickets(
    status_filter: Optional[str] = Query(None, alias="status"),
    category_filter: Optional[str] = Query(None, alias="category"),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List tickets.
    - Agents see all tickets, sorted by priority (High -> Medium -> Low), with optional filters.
    - Customers see only their own tickets, sorted by updated_at descending.
    """
    query = db.query(Ticket)

    if current_user.role == "agent":
        if status_filter:
            query = query.filter(Ticket.status == status_filter)
        if category_filter:
            query = query.filter(Ticket.category == category_filter)
        # Agents see High priority first, then most recently updated
        tickets = query.order_by(priority_order, Ticket.updated_at.desc()).all()
    else:
        # Customers only see their own tickets
        query = query.filter(Ticket.customer_id == current_user.id)
        if status_filter:
            query = query.filter(Ticket.status == status_filter)
        tickets = query.order_by(Ticket.updated_at.desc()).all()

    return tickets


@router.get("/{ticket_id}", response_model=TicketDetailOut)
def get_ticket(
    ticket_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Retrieve single ticket with full message history.
    Customers can only view their own tickets.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if current_user.role != "agent" and ticket.customer_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not authorized to view this ticket."
        )

    return ticket


@router.patch("/{ticket_id}", response_model=TicketDetailOut)
def update_ticket(
    ticket_id: str,
    ticket_update: TicketUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update ticket attributes (status, assignment, category, priority).
    Agents can update all fields. Customers can mark their own tickets as Resolved.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if current_user.role != "agent":
        if ticket.customer_id != current_user.id:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized.")
        # Customer can only update status to Resolved
        if ticket_update.status:
            ticket.status = ticket_update.status
    else:
        # Agent can update everything
        if ticket_update.status is not None:
            ticket.status = ticket_update.status
        if ticket_update.agent_id is not None:
            ticket.agent_id = ticket_update.agent_id if ticket_update.agent_id != "" else None
        if ticket_update.category is not None:
            ticket.category = ticket_update.category
        if ticket_update.priority is not None:
            ticket.priority = ticket_update.priority

    db.commit()
    db.refresh(ticket)
    return ticket


@router.post("/{ticket_id}/messages", response_model=MessageOut, status_code=status.HTTP_201_CREATED)
def post_ticket_message(
    ticket_id: str,
    message_in: MessageCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Post a new reply message in the ticket thread.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    if current_user.role != "agent" and ticket.customer_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Unauthorized.")

    new_msg = TicketMessage(
        ticket_id=ticket.id,
        sender_id=current_user.id,
        message=message_in.message,
        is_ai_suggested=message_in.is_ai_suggested
    )
    db.add(new_msg)

    # If ticket was resolved and customer replies, reopen to "In Progress"
    if current_user.role == "customer" and ticket.status == "Resolved":
        ticket.status = "In Progress"
    elif current_user.role == "agent" and ticket.status == "Open":
        ticket.status = "In Progress"

    db.commit()
    db.refresh(new_msg)
    return new_msg


@router.get("/{ticket_id}/suggest-reply", response_model=RAGSuggestionResponse)
def suggest_reply_for_ticket(
    ticket_id: str,
    current_agent: User = Depends(require_agent),
    db: Session = Depends(get_db)
):
    """
    RAG Pipeline Endpoint (Agent only):
    1. Fetches ticket details & customer info.
    2. Retrieves top relevant KB chunks from ChromaDB.
    3. Prompts LLM to draft a helpful response citing KB sources.
    """
    ticket = db.query(Ticket).filter(Ticket.id == ticket_id).first()
    if not ticket:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Ticket not found.")

    customer_name = ticket.customer.name if ticket.customer else "Customer"

    suggestion = generate_rag_suggestion(
        customer_name=customer_name,
        ticket_title=ticket.title,
        ticket_description=ticket.description,
        ticket_category=ticket.category
    )
    return suggestion

