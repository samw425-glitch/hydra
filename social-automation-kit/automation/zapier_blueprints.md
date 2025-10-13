# Automation Blueprints (Zapier)

Intake → Calendar
- Trigger: Typeform/Google Form submission
- Action: Create rows in Google Sheet/Notion for each required field
- Action: Send Slack/Email notification

Approval → Scheduler
- Trigger: Row status changes to “Approved”
- Action: Create scheduled post in Buffer/Publer with caption, media, and time

Reporting
- Trigger: First day of month
- Action: Compile prior month metrics (Buffer export link + native APIs)
- Action: Create report doc from template, email to client

Fallback Approvals
- Manual step: If no approval in 48h, send reminder email; if still pending, reschedule content next week.
