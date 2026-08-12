import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Support — VitalMen',
  description:
    'VitalMen customer support. Get help with your account, workouts, subscriptions, shop orders, and technical issues.',
  robots: { index: true, follow: true },
};

const contactItems = [
  {
    label: 'General support',
    labelMn: 'Ерөнхий дэмжлэг',
    value: 'support@vitalmen.mn',
    href: 'mailto:support@vitalmen.mn',
  },
  {
    label: 'Privacy & data requests',
    labelMn: 'Нууцлал ба мэдээлэл',
    value: 'privacy@vitalmen.mn',
    href: 'mailto:privacy@vitalmen.mn',
  },
  {
    label: 'App name',
    labelMn: 'Апп',
    value: 'VitalMen',
  },
  {
    label: 'Developer',
    labelMn: 'Хөгжүүлэгч',
    value: 'VitalMen',
  },
];

const sections = [
  {
    title: '1. How to Contact Us',
    titleMn: '1. Холбоо барих',
    body: [
      'For questions, technical issues, billing help, or feedback about the VitalMen mobile app, email our support team. Please include your registered email address and a brief description of the issue so we can assist you faster.',
      'We typically respond within 1–3 business days. Urgent account or payment issues are prioritized.',
    ],
    bodyMn: [
      'VitalMen апптай холбоотой асуулт, техникийн асуудал, төлбөр, санал хүсэлтээр дэмжлэгийн и-мэйлээр холбогдоно уу. Бүртгэлтэй и-мэйл хаяг болон асуудлын товч тайлбарыг заавал бичнэ үү.',
      'Ихэвчлэн 1–3 ажлын өдрийн дотор хариулна. Бүртгэл, төлбөрийн яаралтай асуудлыг эрүүлэн шийдвэрлэнэ.',
    ],
  },
  {
    title: '2. Account & Login',
    titleMn: '2. Бүртгэл ба нэвтрэх',
    body: [
      'Forgot your password? Use the sign-in screen in the app to reset access, or contact us if you no longer have access to your email.',
      'To update your profile name or email, open Profile in the app after signing in.',
      'To request permanent account deletion and removal of associated personal data, email support@vitalmen.mn from your registered address. See our Privacy Policy for details.',
    ],
    bodyMn: [
      'Нууц үгээ мартсан уу? Апп дахь нэвтрэх хэсгээс сэргээх эсвэл и-мэйл хаягтаа хандах боломжгүй бол бидэнтэй холбогдоно уу.',
      'Профайлын нэр, и-мэйл шинэчлэхийг апп дотор Profile хэсгээс хийнэ.',
      'Бүртгэл болон холбогдох хувийн мэдээллийг бүрмөсөн устгуулах хүсэлтийг бүртгэлтэй и-мэйлээс support@vitalmen.mn руу илгээнэ үү. Дэлгэрэнгүйг Нууцлалын бодлогоос үзнэ үү.',
    ],
  },
  {
    title: '3. Subscriptions & Payments',
    titleMn: '3. Гишүүнчлэл ба төлбөр',
    body: [
      'VitalMen offers premium membership plans within the app. Payment may be processed via QPay or bank transfer, depending on current settings.',
      'If a payment was completed but premium access was not activated, contact us with your payment reference, date, and registered email.',
      'Refund requests are reviewed case by case in accordance with applicable store policies and local regulations.',
    ],
    bodyMn: [
      'VitalMen апп дотор premium гишүүнчлэлийн багц санал болгодог. Төлбөр QPay эсвэл банкны шилжүүлгээр хийгдэж болно.',
      'Төлбөр амжилттай болсон ч premium идэвхжээгүй бол төлбөрийн дугаар, огноо, бүртгэлтэй и-мэйлээ илгээнэ үү.',
      'Буцаалтын хүсэлтийг дэлгүүрийн бодлого болон холбогдох хуулийн дагуу тохиолдлоор шийдвэрлэнэ.',
    ],
  },
  {
    title: '4. Shop Orders',
    titleMn: '4. Дэлгүүрийн захиалга',
    body: [
      'For questions about product availability, order status, shipping, or returns, email support@vitalmen.mn with your order details.',
      'Include your full name, phone number, order date, and products ordered when contacting us about a shop purchase.',
    ],
    bodyMn: [
      'Бүтээгдэхүүний боломж, захиалгын төлөв, хүргэлт, буцаалтын талаар support@vitalmen.mn руу захиалгын мэдээллээ илгээнэ үү.',
      'Дэлгүүрээс худалдан авсан асуудалд бүтэн нэр, утас, захиалгын огноо, бүтээгдэхүүний жагсаалтыг заавал бичнэ үү.',
    ],
  },
  {
    title: '5. Workouts & App Features',
    titleMn: '5. Дасгал ба аппын функц',
    body: [
      'Workout plans, progress tracking, and educational content are updated through the VitalMen admin system. If content appears missing or incorrect, let us know which screen and exercise you were viewing.',
      'For crashes, freezes, or performance issues, include your device model, iOS/Android version, and app version if available.',
    ],
    bodyMn: [
      'Дасгалын хөтөлбөр, явц, сургалтын контент админаас шинэчлэгддэг. Контент дутуу эсвэл буруу харагдвал аль дэлгэц, дасгалыг үзсэнээ зааж мэдэгдэнэ үү.',
      'Апп гацах, унах, удаан ажиллах тохиолдолд төхөөрөмжийн загвар, iOS/Android хувилбар, аппын хувилбарыг (байвал) илгээнэ үү.',
    ],
  },
  {
    title: '6. Privacy & Data',
    titleMn: '6. Нууцлал ба мэдээлэл',
    body: [
      'For privacy-related questions, data access requests, or account deletion under our Privacy Policy, contact privacy@vitalmen.mn or review the full policy linked below.',
    ],
    bodyMn: [
      'Нууцлалтай холбоотой асуулт, мэдээлэл авах, бүртгэл устгах хүсэлтийг privacy@vitalmen.mn руу илгээх эсвэл доорх Нууцлалын бодлогыг уншина уу.',
    ],
  },
];

export default function SupportPage() {
  const lastUpdated = 'August 12, 2026';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-5">
          <div>
            <p className="text-sm font-semibold text-primary">VitalMen</p>
            <h1 className="text-2xl font-bold tracking-tight">Support</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Дэмжлэг · Last updated: {lastUpdated}
            </p>
          </div>
          <Link
            href="/login"
            className="text-sm font-medium text-primary hover:underline"
          >
            Admin
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-3xl px-6 py-10">
        <p className="mb-8 rounded-lg border border-border bg-muted/40 p-4 text-sm leading-relaxed text-muted-foreground">
          This page is the official support URL for the VitalMen mobile app,
          submitted to Google Play and Apple App Store. It is available publicly at{' '}
          <strong className="text-foreground">/support</strong>.
        </p>

        <section className="mb-10 rounded-xl border border-border bg-card p-6">
          <h2 className="text-lg font-bold text-foreground">Contact</h2>
          <h3 className="mt-1 text-base font-semibold text-primary">Холбоо барих</h3>
          <dl className="mt-5 space-y-4">
            {contactItems.map((item) => (
              <div key={item.label} className="grid gap-1 sm:grid-cols-[180px_1fr]">
                <dt className="text-sm font-medium text-muted-foreground">
                  {item.label}
                  <span className="mt-0.5 block text-xs text-primary/80">{item.labelMn}</span>
                </dt>
                <dd className="text-sm text-foreground">
                  {item.href ? (
                    <a href={item.href} className="font-medium text-primary hover:underline">
                      {item.value}
                    </a>
                  ) : (
                    item.value
                  )}
                </dd>
              </div>
            ))}
          </dl>
        </section>

        <div className="space-y-10">
          {sections.map((section) => (
            <section key={section.title}>
              <h2 className="text-lg font-bold text-foreground">{section.title}</h2>
              <h3 className="mt-1 text-base font-semibold text-primary">
                {section.titleMn}
              </h3>
              <div className="mt-4 space-y-3 text-sm leading-relaxed text-muted-foreground">
                {section.body.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
              <div className="mt-4 space-y-3 border-l-2 border-primary/30 pl-4 text-sm leading-relaxed text-foreground/80">
                {section.bodyMn.map((paragraph) => (
                  <p key={paragraph.slice(0, 40)}>{paragraph}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <footer className="mt-16 border-t border-border pt-8 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} VitalMen. All rights reserved.</p>
          <p className="mt-2 space-x-4">
            <a href="mailto:support@vitalmen.mn" className="text-primary hover:underline">
              support@vitalmen.mn
            </a>
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
          </p>
        </footer>
      </main>
    </div>
  );
}
