import { LegalScreen, LegalSection } from '@/components/legal/LegalScreen'
import { Body } from '@/components/ui/Typography'
import { SUPPORT_EMAIL } from '@src/lib/support-contact'

export default function PrivacyPolicyScreen() {
  return (
    <LegalScreen title="Privacy policy" subtitle="How we handle your data" lastUpdated="17 Aug 2026">
      <LegalSection title="Who this applies to">
        This policy describes how AiShopy collects and uses information when you use our merchant
        app, storefront, and related services. If you have questions, email {SUPPORT_EMAIL}.
      </LegalSection>

      <LegalSection title="Information we collect">
        Account details such as your name, email, and sign-in identifiers. Store details such as
        store name, branding, catalog, and settings. Customer and order information you add or that
        customers submit on your storefront. Messaging data from connected WhatsApp or Instagram
        inboxes. Device and usage information needed to operate and improve the app.
      </LegalSection>

      <LegalSection title="How we use information">
        We use this information to provide your store, process orders, send notifications, support
        chat and inbox features, improve the product, and keep accounts secure. We do not sell your
        personal information.
      </LegalSection>

      <LegalSection title="WhatsApp, Instagram, and payments">
        If you connect WhatsApp, Instagram, or a payment provider, those services process related
        data under their own terms. We only use that data to run the features you enable, such as
        inbox, catalog sharing, and checkout.
      </LegalSection>

      <LegalSection title="Sharing, retention, and security">
        We share information with service providers who help us host, send messages, process
        payments, or support the app. We keep information while your account is active and as needed
        for legal, security, or operational reasons. We use reasonable safeguards, but no method of
        transmission or storage is completely secure.
      </LegalSection>

      <LegalSection title="Your responsibilities">
        You are responsible for the customer data you collect through your store, including getting
        any consents required for WhatsApp, marketing, or checkout. Do not use AiShopy to process
        information you are not allowed to collect.
      </LegalSection>

      <LegalSection title="Your choices">
        You can update store and account details in the app. To request access, correction, or
        deletion of your account data, email {SUPPORT_EMAIL}. We may need to keep some records for
        legal or billing reasons.
      </LegalSection>

      <Body className="text-gray-600 leading-6">
        Contact us at {SUPPORT_EMAIL} for privacy requests or questions.
      </Body>
    </LegalScreen>
  )
}
