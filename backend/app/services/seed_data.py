KB_ARTICLES_DATA = [
    # ── Billing Articles (5) ──────────────────────────────────────────────────
    {
        "title": "Refund Policy & Dispute Processing",
        "category": "Billing",
        "content": (
            "We offer a 30-day money-back guarantee for all annual and monthly subscriptions. "
            "To be eligible for a full refund, you must submit your refund request within 30 days of the transaction date. "
            "Refunds are processed back to the original payment method within 5-10 business days. "
            "If you notice duplicate charges on your bank statement, please provide the transaction IDs and dates. "
            "Duplicate charges resulting from gateway connection retries will be immediately refunded in full."
        ),
    },
    {
        "title": "Updating Credit Cards & Payment Methods",
        "category": "Billing",
        "content": (
            "You can update your credit card or billing details at any time by going to Settings > Billing > Payment Methods. "
            "We accept Visa, Mastercard, American Express, and Discover. "
            "When updating a card, our payment gateway places a temporary $1 authorization hold which drops off in 24 hours. "
            "If your payment fails due to an expired card, the system will automatically retry charging the new card within 4 hours."
        ),
    },
    {
        "title": "Downloading Invoices & Tax/VAT Receipts",
        "category": "Billing",
        "content": (
            "Official PDF invoices and tax receipts are generated on the 1st of every month or immediately after plan changes. "
            "To download invoices: navigate to Settings > Billing > Invoices. "
            "If your organization requires a VAT ID, company registration number, or custom billing address on invoices, "
            "update these in the 'Billing Address & Tax ID' field before downloading past or future invoices."
        ),
    },
    {
        "title": "Canceling or Pausing Your Subscription",
        "category": "Billing",
        "content": (
            "You can cancel your subscription at any time without cancellation fees. "
            "Navigate to Settings > Subscription > Cancel Plan. "
            "Upon cancellation, your account remains active on the paid tier until the end of your current billing cycle. "
            "After the billing cycle ends, your account transitions to the Free plan, and your data is securely preserved for 90 days. "
            "You can also pause your account for up to 3 months instead of canceling."
        ),
    },
    {
        "title": "Prorated Charges on Plan Upgrades & Downgrades",
        "category": "Billing",
        "content": (
            "When you upgrade from Starter to Pro or Enterprise mid-cycle, you are only charged the prorated difference for the remaining days. "
            "For example, upgrading 15 days into a 30-day cycle results in a 50% credit from your old tier applied to the new tier. "
            "Downgrades take effect at the start of your next billing cycle, and no refund is issued for unused days on the higher plan."
        ),
    },

    # ── Technical Articles (5) ────────────────────────────────────────────────
    {
        "title": "Troubleshooting HTTP 500 & Gateway Timeouts",
        "category": "Technical",
        "content": (
            "HTTP 500 Internal Server Errors or 504 Gateway Timeouts usually occur when an upstream service fails or request payload exceeds processing limits. "
            "Step 1: Check https://status.ourplatform.com for ongoing platform incidents. "
            "Step 2: Check your API request payload size; batch requests should not exceed 500 records or 10MB per payload. "
            "Step 3: Inspect your API error response headers for 'X-Request-Id' and include this ID when opening a technical support ticket. "
            "Step 4: Retry the request using an exponential backoff strategy (e.g. 1s, 2s, 4s, 8s)."
        ),
    },
    {
        "title": "API Rate Limits, Throttling, and Headers",
        "category": "Technical",
        "content": (
            "API rate limits are enforced on a per-minute rolling window based on your plan: "
            "Free tier: 60 requests/min; Pro tier: 600 requests/min; Enterprise: 3,000 requests/min. "
            "When rate limited, the API returns HTTP 429 Too Many Requests. "
            "Look at the response headers: 'X-RateLimit-Limit', 'X-RateLimit-Remaining', and 'Retry-After' (seconds until reset). "
            "We strongly advise implementing token-bucket client rate limiting to avoid dropped requests."
        ),
    },
    {
        "title": "Webhook Delivery Retries & HMAC Signature Verification",
        "category": "Technical",
        "content": (
            "All outbound webhooks include an 'X-Signature-SHA256' header computed using your webhook signing secret. "
            "To verify authenticity, compute the HMAC-SHA256 of the raw request body using your secret and compare using constant-time string comparison. "
            "Our webhook dispatcher expects an HTTP 200 or 204 response within 5 seconds. "
            "If your server fails or times out, the system retries delivery up to 6 times at intervals of 1m, 5m, 15m, 1h, 6h, and 24h before disabling the endpoint."
        ),
    },
    {
        "title": "Configuring Single Sign-On (SSO) with SAML 2.0 / Okta",
        "category": "Technical",
        "content": (
            "Enterprise workspaces support SAML 2.0 Identity Providers including Okta, Azure AD (Entra ID), and Google Workspace. "
            "To configure: In Workspace Settings > Security > SSO, enter your IdP Metadata URL or upload the XML file. "
            "Our ACS URL is https://auth.ourplatform.com/saml/consume and Entity ID is urn:ourplatform:auth. "
            "Ensure the NameID attribute is configured to provide the user's primary corporate email address. "
            "Just-In-Time (JIT) provisioning is enabled by default for users with authorized email domains."
        ),
    },
    {
        "title": "Password Reset Link Expiration & Email Delivery",
        "category": "Technical",
        "content": (
            "Password reset tokens expire precisely 30 minutes after generation for security. "
            "If you do not see the password reset email: "
            "1. Check your spam and junk folders. "
            "2. Ensure your corporate email filter does not block notifications from no-reply@ourplatform.com. "
            "3. If multiple reset requests were triggered, only the link in the MOST RECENT email will be valid. "
            "4. Contact your workspace administrator if your account is managed via SSO, as local password reset is disabled for SSO accounts."
        ),
    },

    # ── General Articles (5) ──────────────────────────────────────────────────
    {
        "title": "Support Operating Hours & Service Level Agreement (SLA)",
        "category": "General",
        "content": (
            "Our customer support team operates 24 hours a day, 7 days a week for critical severity issues. "
            "Standard business support operates Monday through Friday from 8:00 AM to 8:00 PM EST. "
            "Guaranteed first-response SLAs: "
            "High Priority (system outage, payment failures): within 1 hour. "
            "Medium Priority (technical bugs, general billing queries): within 4 hours. "
            "Low Priority (general how-to, feature feedback): within 1 business day."
        ),
    },
    {
        "title": "GDPR Compliance, Data Privacy & Account Deletion",
        "category": "General",
        "content": (
            "We comply with GDPR, CCPA, and SOC 2 Type II standards. "
            "To export all workspace data: go to Settings > Privacy > Export All Data (generates an encrypted JSON archive within 24h). "
            "To request complete account deletion (Right to be Forgotten): send a request via the helpdesk. "
            "Once confirmed, all personal identifiable information (PII) and databases are permanently erased after 30 days."
        ),
    },
    {
        "title": "Inviting Team Members & Role Permissions",
        "category": "General",
        "content": (
            "You can invite colleagues to your workspace under Settings > Team Members > Invite. "
            "Available workspace roles: "
            "1. Owner: Full billing, security, and administrative access. "
            "2. Admin: Can manage team members, integrations, and tickets, but cannot view invoices. "
            "3. Member: Can create, view, and comment on tickets and projects. "
            "Invited users receive an email invitation valid for 7 days."
        ),
    },
    {
        "title": "Submitting Feature Requests & Roadmap Voting",
        "category": "General",
        "content": (
            "We prioritize product roadmap features based on community feedback. "
            "To submit a feature request, visit https://feedback.ourplatform.com or file a ticket under the 'General' category with prefix '[Feature Request]'. "
            "Our product team reviews submissions weekly and moves highly upvoted items into the public quarterly roadmap."
        ),
    },
    {
        "title": "System Status Page & Scheduled Maintenance Alerts",
        "category": "General",
        "content": (
            "Platform health, real-time uptime metrics, and scheduled maintenance windows are publicly tracked at https://status.ourplatform.com. "
            "You can subscribe via SMS, email, or Slack notifications for instantaneous incident alerts. "
            "Routine maintenance windows are scheduled on Sundays between 02:00 AM and 04:00 AM UTC and announced at least 72 hours in advance."
        ),
    },
]

DEMO_USERS = [
    {
        "name": "Sarah Chen",
        "email": "agent@example.com",
        "password": "password123",
        "role": "agent",
    },
    {
        "name": "Alex Rivera",
        "email": "customer@example.com",
        "password": "password123",
        "role": "customer",
    },
    {
        "name": "David Miller",
        "email": "david@example.com",
        "password": "password123",
        "role": "customer",
    },
]

SAMPLE_TICKETS = [
    {
        "customer_email": "customer@example.com",
        "title": "Charged twice for October Pro subscription",
        "description": "I noticed two identical charges of $49 on my Visa credit card statement yesterday. Could you please check this and refund the duplicate payment?",
        "category": "Billing",
        "priority": "High",
        "status": "Open",
        "messages": [
            {
                "sender_email": "customer@example.com",
                "message": "I noticed two identical charges of $49 on my Visa credit card statement yesterday. Could you please check this and refund the duplicate payment?",
                "is_ai_suggested": False,
            }
        ],
    },
    {
        "customer_email": "david@example.com",
        "title": "API returning 429 Too Many Requests unexpectedly",
        "description": "Our sync worker started receiving HTTP 429 errors today at 10 AM. We are on the Pro tier which should allow 600 req/min. Can you verify if our limit was throttled?",
        "category": "Technical",
        "priority": "Medium",
        "status": "In Progress",
        "messages": [
            {
                "sender_email": "david@example.com",
                "message": "Our sync worker started receiving HTTP 429 errors today at 10 AM. We are on the Pro tier which should allow 600 req/min. Can you verify if our limit was throttled?",
                "is_ai_suggested": False,
            },
            {
                "sender_email": "agent@example.com",
                "message": "Hi David, I am investigating your API traffic logs right now to see if there were sudden burst spikes exceeding the per-minute rolling window.",
                "is_ai_suggested": False,
            }
        ],
    },
    {
        "customer_email": "customer@example.com",
        "title": "How to invite new team members to our workspace?",
        "description": "We just hired three engineers and I want to grant them access to our team workspace. Where do I find the invite button and what permissions will they get?",
        "category": "General",
        "priority": "Low",
        "status": "Resolved",
        "messages": [
            {
                "sender_email": "customer@example.com",
                "message": "We just hired three engineers and I want to grant them access to our team workspace. Where do I find the invite button and what permissions will they get?",
                "is_ai_suggested": False,
            },
            {
                "sender_email": "agent@example.com",
                "message": "Hi Alex, you can invite your team members under Settings > Team Members > Invite. You can assign them as Admin or Member depending on their responsibilities.",
                "is_ai_suggested": True,
            },
            {
                "sender_email": "customer@example.com",
                "message": "Got it, that was super easy! Thanks for the quick help.",
                "is_ai_suggested": False,
            }
        ],
    },
]

