"use client"

interface EmailData {
  to: string
  subject: string
  body: string
  type: "customer_confirmation" | "admin_notification" | "enquiry_response"
}

class EmailService {
  static async sendEmail(emailData: EmailData): Promise<boolean> {
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000))
      console.log("📧 Email sent:", { to: emailData.to, subject: emailData.subject, type: emailData.type, timestamp: new Date().toISOString() })
      return true
    } catch (error) {
      console.error("Failed to send email:", error)
      return false
    }
  }

  static async sendCustomerConfirmation(customerEmail: string, customerName: string, productName: string, enquiryId: string): Promise<boolean> {
    const subject = "Enquiry Received - Greenbeam"
    const body = `Dear ${customerName},\n\nThank you for your enquiry about ${productName}. We have received your message and our team will review it within 24 hours.\n\nEnquiry ID: ${enquiryId}\nProduct: ${productName}\nSubmitted: ${new Date().toLocaleString()}\n\nBest regards,\nThe Greenbeam Team`
    return this.sendEmail({ to: customerEmail, subject, body, type: "customer_confirmation" })
  }

  static async sendAdminNotification(adminEmail: string, customerName: string, productName: string, enquiryId: string): Promise<boolean> {
    const subject = "New Product Enquiry - Admin Notification"
    const body = `New enquiry received:\nCustomer: ${customerName}\nProduct: ${productName}\nEnquiry ID: ${enquiryId}\nTime: ${new Date().toLocaleString()}`
    return this.sendEmail({ to: adminEmail, subject, body, type: "admin_notification" })
  }

  static async sendEnquiryResponse(customerEmail: string, customerName: string, responseMessage: string, enquiryId: string): Promise<boolean> {
    const subject = "Response to Your Enquiry - Greenbeam"
    const body = `Dear ${customerName},\n\nThank you for your enquiry. Here is our response:\n\n${responseMessage}\n\nBest regards,\nThe Greenbeam Team`
    return this.sendEmail({ to: customerEmail, subject, body, type: "enquiry_response" })
  }
}

export default EmailService
