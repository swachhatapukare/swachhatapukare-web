"""
Generate official PDF policies for SwachhataPukare Foundation:
1. Terms & Conditions (assets/docs/terms-and-conditions.pdf)
2. Payment Policy (assets/docs/payment-policy.pdf)
"""

import os
from reportlab.lib.pagesizes import letter
from reportlab.lib import colors
from reportlab.platypus import (
    SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, HRFlowable, KeepTogether
)
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import inch

os.makedirs('assets/docs', exist_ok=True)

primary_color = colors.HexColor('#0B2E4F')   # Foundation Navy
accent_color = colors.HexColor('#176BAE')    # Foundation Blue
text_color = colors.HexColor('#1A202C')      # Dark Slate
muted_color = colors.HexColor('#4A5568')     # Slate Muted
light_bg = colors.HexColor('#F4F8FD')        # Light Wash
border_color = colors.HexColor('#CBD5E1')

styles = getSampleStyleSheet()

header_style = ParagraphStyle(
    'DocHeader',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=18,
    leading=22,
    textColor=primary_color,
    spaceAfter=4
)

subtitle_style = ParagraphStyle(
    'DocSubtitle',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=10,
    leading=14,
    textColor=muted_color,
    spaceAfter=12
)

h1_style = ParagraphStyle(
    'SectionH1',
    parent=styles['Normal'],
    fontName='Helvetica-Bold',
    fontSize=12,
    leading=16,
    textColor=accent_color,
    spaceBefore=12,
    spaceAfter=6
)

body_style = ParagraphStyle(
    'BodyTextCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    leading=13,
    textColor=text_color,
    spaceAfter=6
)

bullet_style = ParagraphStyle(
    'BulletCustom',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=9,
    leading=13,
    textColor=text_color,
    leftIndent=15,
    spaceAfter=4
)

footer_style = ParagraphStyle(
    'FooterText',
    parent=styles['Normal'],
    fontName='Helvetica',
    fontSize=8,
    leading=11,
    textColor=muted_color,
    alignment=1
)

def build_pdf(filename, title, subtitle, sections):
    filepath = os.path.join('assets', 'docs', filename)
    doc = SimpleDocTemplate(
        filepath,
        pagesize=letter,
        leftMargin=0.75 * inch,
        rightMargin=0.75 * inch,
        topMargin=0.75 * inch,
        bottomMargin=0.75 * inch
    )

    story = []

    # Title & Header
    story.append(Paragraph("SWACHHATAPUKARE FOUNDATION", ParagraphStyle(
        'BrandEyebrow',
        fontName='Helvetica-Bold',
        fontSize=10,
        leading=12,
        textColor=accent_color,
        spaceAfter=4
    )))
    story.append(Paragraph(title, header_style))
    story.append(Paragraph(subtitle, subtitle_style))
    story.append(HRFlowable(width="100%", thickness=1.5, color=accent_color, spaceAfter=14))

    for sec_num, sec_title, sec_paragraphs in sections:
        sec_heading = f"{sec_num}. {sec_title}"
        story.append(Paragraph(sec_heading, h1_style))
        for p in sec_paragraphs:
            if p.startswith("• "):
                story.append(Paragraph(p, bullet_style))
            else:
                story.append(Paragraph(p, body_style))
        story.append(Spacer(1, 4))

    # Sign-off box
    story.append(Spacer(1, 10))
    story.append(HRFlowable(width="100%", thickness=0.8, color=border_color, spaceAfter=10))
    info_text = (
        "<b>SwachhataPukare Foundation</b> (Section 8 Non-Profit Organization)<br/>"
        "Registered Office: HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013<br/>"
        "GSTIN: 20ABHCS8922N1ZZ | Email: legal@swachhatapukare.com | Website: www.swachhatapukare.com"
    )
    story.append(Paragraph(info_text, footer_style))

    doc.build(story)
    print(f"Generated {filepath} successfully.")

# 1. Terms & Conditions
terms_sections = [
    ("1", "Introduction & Legal Status", [
        "SwachhataPukare Foundation is a registered Section 8 non-profit organization established under the laws of India, having its principal office at HIG-276, Ward No-15, Near Bank Of Baroda, Adityapur, Jamshedpur, Jharkhand 831013.",
        "By accessing our website, browsing our handcrafted catalogue, donating, volunteering, or purchasing products, you ('User', 'Customer', 'You') agree to be bound by these Terms & Conditions and all applicable statutory regulations."
    ]),
    ("2", "Handcrafted Catalogue & Product Character", [
        "All products sold through our shop are handcrafted by local artisans, including rural self-help groups working with harvested water hyacinth weed and natural fibers.",
        "• Material Authenticity: Only pieces explicitly designated with the 'Water Hyacinth' tag contain genuine water hyacinth fibers.",
        "• Unique Variations: Because every item is individually crafted by hand, slight differences in texture, natural coloring, weave patterns, and minor millimeter dimensions are inherent characteristics and not manufacturing defects.",
        "• Pricing: All catalogue prices are displayed in Indian Rupees (INR) and represent the product value. Courier charges and custom printing quotes are calculated separately."
    ]),
    ("3", "Ordering, Checkout & Consent", [
        "• Agreement at Checkout: In accordance with the Digital Personal Data Protection Act, 2023 (DPDP Act) and the Information Technology Act, 2000, you are required to explicitly verify and consent to these Terms & Conditions and our Privacy Policy before completing any purchase.",
        "• Accuracy of Information: You agree to provide true, accurate, and complete contact and delivery information (including full recipient name, 10-digit mobile number, valid email, and 6-digit postal PIN code)."
    ]),
    ("4", "Fulfilment, Shipping & PAN India Delivery", [
        "• Delivery Network: Fulfilment is carried out via our authorized logistics partners (Delhivery, India Post, and allied courier networks) offering comprehensive coverage of over 28,000+ PIN codes across all 28 Indian States and 8 Union Territories.",
        "• Dispatch Schedule: Orders are typically packed and dispatched within 24 to 48 hours following confirmation.",
        "• Inspection Upon Delivery: Please inspect parcel packaging upon receipt and notify our team within 48 hours if package damage has occurred in transit."
    ]),
    ("5", "Returns, Replacements & Non-Profit Mission", [
        "Proceeds from our catalogue directly support the Foundation's environmental drives and artisan livelihoods.",
        "• If an item arrives damaged or broken, submit a photo and order details within 48 hours for a prompt replacement or full refund.",
        "• Non-damaged items may be returned within 7 days in their original unused condition."
    ]),
    ("6", "Digital Personal Data Protection (DPDP Act Compliance)", [
        "• We process personal data solely for fulfilling your order, providing delivery notifications, or processing donations.",
        "• We do not sell, rent, or trade your personal data to any third party for commercial marketing.",
        "• You retain the right under the DPDP Act to access, correct, or request deletion of your personal data by writing to our designated Data Grievance Officer."
    ]),
    ("7", "Governing Law & Dispute Resolution", [
        "These Terms shall be governed by and construed in accordance with the laws of India. Any legal dispute or claim arising hereunder shall be subject to the exclusive jurisdiction of the competent courts at Jamshedpur / Seraikela-Kharsawan, Jharkhand."
    ])
]

# 2. Payment Policy
payment_sections = [
    ("1", "Overview & Transparency", [
        "SwachhataPukare Foundation is committed to complete transparency, financial integrity, and security across all customer transactions and charitable donations.",
        "Every rupee generated through product sales directly sustains artisan skill training, river clean-up machinery, and community welfare programs."
    ]),
    ("2", "Accepted Payment Methods", [
        "We support a wide array of recognized, secure digital and physical payment channels across India:",
        "• UPI (Unified Payments Interface): Google Pay, PhonePe, Paytm, BHIM, and bank UPI apps.",
        "• Debit & Credit Cards: Visa, MasterCard, RuPay, and American Express issued by Indian and international banks.",
        "• Net Banking: Instant direct bank transfers from all major scheduled public and private commercial banks.",
        "• Cash on Delivery (COD): Available for domestic orders up to a maximum limit of ₹5,000. For orders exceeding this threshold, digital prepayments are required for logistics safety."
    ]),
    ("3", "Taxes & Transparent Pricing", [
        "• Goods & Services Tax (GST): Product sales are billed under GSTIN: 20ABHCS8922N1ZZ at the applicable statutory rate of 5% on handicraft goods.",
        "• Product Invoicing: A GST-compliant tax invoice is generated for every completed purchase and is downloadable from your Account dashboard or Confirmation page.",
        "• Courier & Fulfilment: Courier rates are quoted at cost or flat ₹79 across PAN India, with Free Courier unlocked on all orders over ₹999."
    ]),
    ("4", "Security & Data Protection Standards", [
        "• RBI Compliance: All online transactions adhere to Reserve Bank of India (RBI) mandates including mandatory two-factor authentication (2FA) and tokenization.",
        "• Card Details Non-Retention: SwachhataPukare Foundation never stores, logs, or views your complete credit/debit card numbers, CVV, or banking passwords.",
        "• SSL Encryption: All checkout communication is secured using industry-standard TLS/SSL encryption (256-bit)."
    ]),
    ("5", "Refunds, Cancellations & Settlements", [
        "• Order Cancellation: You may request cancellation of an order before dispatch by contacting customer support or via WhatsApp.",
        "• Refund Processing: Once an eligible refund or return is approved, funds are automatically remitted back to the original source account within 5 to 7 banking days.",
        "• COD Refunds: For Cash on Delivery returns, refunds are credited directly to the customer's verified bank account or UPI ID upon receipt of returned goods."
    ]),
    ("6", "Contact & Billing Queries", [
        "For any billing questions, invoice corrections, or transaction clarifications, please contact our Accounts Team at accounts@swachhatapukare.com or WhatsApp +91 99343 04800."
    ])
]

if __name__ == '__main__':
    build_pdf(
        "terms-and-conditions.pdf",
        "Terms & Conditions",
        "Effective Date: October 2026 | Document Ref: SPF-POL-TC-2026-v1.0",
        terms_sections
    )
    build_pdf(
        "payment-policy.pdf",
        "Payment & Billing Policy",
        "Effective Date: October 2026 | Document Ref: SPF-POL-PAY-2026-v1.0",
        payment_sections
    )

