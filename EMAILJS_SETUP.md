# EmailJS Setup Guide

To enable email sending functionality in the EmailTemplates component, you need to set up EmailJS:

## 1. Create an EmailJS Account

- Go to [https://www.emailjs.com/](https://www.emailjs.com/)
- Sign up for a free account

## 2. Create an Email Service

- In your EmailJS dashboard, go to "Email Services"
- Click "Add New Service"
- Choose your email provider (Gmail, Outlook, Yahoo, etc.)
- Follow the setup instructions to connect your email account
- **Important**: Configure the recipient email address in the service settings

## 3. Create an Email Template

- Go to "Email Templates" in your dashboard
- Click "Create New Template"
- Set up a template with these variables:
  - `{{subject}}` - Email subject line
  - `{{message}}` - Email content/body
  - `{{from_name}}` - Sender name (will be "Support Team")

## 4. Get Your Credentials

- Service ID: Found in Email Services section
- Template ID: Found in Email Templates section
- Public Key: Found in Account > General

## 5. Update the Component

In `src/components/EmailTemplates/EmailTemplates.tsx`, the credentials are already configured:

```typescript
const EMAILJS_SERVICE_ID = "service_m5nq9qc";
const EMAILJS_TEMPLATE_ID = "template_gdm7rsq";
const EMAILJS_PUBLIC_KEY = "k9brA3kH9BU6FsQZb";
```

## 6. Test the Setup

- Start your development server
- Go to the Email Templates page
- Click "Refresh Templates" to load your templates
- Try sending a test email using one of your templates

## Note

- Emails will be sent to the recipient configured in your EmailJS service
- For sending to different recipients, you may need to create multiple services or upgrade to EmailJS paid plans
- EmailJS has a free tier with limited emails per month</content>
  <parameter name="filePath">m:\logic-legends-final\EMAILJS_SETUP.md
