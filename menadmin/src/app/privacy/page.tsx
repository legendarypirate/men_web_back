import type { Metadata } from 'next';
import Link from 'next/link';
import { LegalPageShell } from '@/components/landing/legal-page-shell';

export const metadata: Metadata = {
  title: 'Privacy Policy — Tenkhee Plus',
  description:
    'Tenkhee Plus mobile application privacy policy. Learn how we collect, use, and protect your personal information.',
  robots: { index: true, follow: true },
};

const sections = [
  {
    title: '1. Introduction',
    titleMn: '1. Оршил',
    body: [
      'Tenkhee Plus (“we”, “our”, or “us”) operates the Tenkhee Plus mobile application and related services (the “Service”). This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our app.',
      'By using Tenkhee Plus, you agree to the collection and use of information in accordance with this policy. If you do not agree, please do not use the Service.',
    ],
    bodyMn: [
      'Tenkhee Plus (“бид”) нь Tenkhee Plus гар утасны апп болон холбогдох үйлчилгээг (“Үйлчилгээ”) үзүүлдэг. Энэхүү Нууцлалын бодлого нь та манай аппыг ашиглах үед таны мэдээллийг хэрхэн цуглуулж, ашиглаж, хамгаалдаг талаар тайлбарлана.',
      'Tenkhee Plus-ийг ашигласнаар та энэ бодлогын дагуу мэдээлэл цуглуулж, ашиглахыг зөвшөөрч байна. Хэрэв та зөвшөөрөхгүй бол Үйлчилгээг ашиглахгүй байна уу.',
    ],
  },
  {
    title: '2. Information We Collect',
    titleMn: '2. Цуглуулдаг мэдээлэл',
    body: [
      'Account information: name, email address, and password (stored securely using industry-standard hashing).',
      'Profile & health data: fitness goals, workout history, progress statistics, assessment responses, and membership status.',
      'Payment information: subscription plan selections and payment status. Payment processing may be handled by third-party providers (e.g., QPay, banks). We do not store full payment card details on our servers.',
      'Shop & orders: products viewed, cart contents, shipping contact details, and order history.',
      'Device & app data: authentication tokens stored locally on your device, app preferences (such as theme settings), and basic technical logs needed to operate the Service.',
    ],
    bodyMn: [
      'Бүртгэлийн мэдээлэл: нэр, и-мэйл хаяг, нууц үг (аюулгүй hash хэлбэрээр хадгална).',
      'Профайл ба эрүүл мэндийн мэдээлэл: фитнес зорилго, дасгалын түүх, явцын статистик, үнэлгээний хариулт, гишүүнчлэлийн төлөв.',
      'Төлбөрийн мэдээлэл: багц сонголт, төлбөрийн төлөв. Төлбөр нь гуравдагч этгээд (QPay, банк г.м) дамжин боловсруулагдаж болно. Бид таны бүрэн картын мэдээллийг сервер дээр хадгалдаггүй.',
      'Дэлгүүр ба захиалга: үзсэн бүтээгдэхүүн, сагс, хүргэлтийн холбоо барих мэдээлэл, захиалгын түүх.',
      'Төхөөрөмж ба апп: төхөөрөмж дээр хадгалагдах нэвтрэх token, аппын тохиргоо (жишээ нь горим), үйлчилгээ ажиллуулахад шаардлагатай техникийн лог.',
    ],
  },
  {
    title: '3. How We Use Your Information',
    titleMn: '3. Мэдээллийг хэрхэн ашигладаг вэ',
    body: [
      'Provide, maintain, and improve the Tenkhee Plus app and personalized workout experiences.',
      'Process subscriptions, in-app purchases, and shop orders.',
      'Track your fitness progress and display relevant content.',
      'Send important service notifications and respond to support requests.',
      'Protect against fraud, abuse, and unauthorized access.',
      'Comply with applicable laws and regulations.',
    ],
    bodyMn: [
      'Tenkhee Plus апп болон хувийн дасгалын туршлагыг үзүүлж, сайжруулах.',
      'Гишүүнчлэл, дэлгүүрийн захиалга, төлбөрийг боловсруулах.',
      'Таны фитнесийн явцыг хадгалж, холбогдох контент харуулах.',
      'Чухал мэдэгдэл илгээх, дэмжлэгийн хүсэлтэд хариулах.',
      'Залилан, зөвшөөрөлгүй хандалтаас хамгаалах.',
      'Холбогдох хууль, дүрмийг мөрдөх.',
    ],
  },
  {
    title: '4. Information Sharing',
    titleMn: '4. Мэдээлэл хуваалцах',
    body: [
      'We do not sell your personal information.',
      'We may share data with trusted service providers who help us operate the Service (hosting, payment processors, cloud storage for media assets), subject to confidentiality obligations.',
      'We may disclose information if required by law, court order, or to protect the rights, safety, and security of Tenkhee Plus and our users.',
    ],
    bodyMn: [
      'Бид таны хувийн мэдээллийг худалдаж, борлуулдаггүй.',
      'Үйлчилгээ ажиллуулахад туслах найдвартай үйлчилгээ үзүүлэгчидтэй (hosting, төлбөр, медиа хадгалалт) нууцлалын үүрэгтэйгээр хуваалцаж болно.',
      'Хууль, шүүхийн шийдвэрээр шаардлагатай бол, эсвэл Tenkhee Plus болон хэрэглэгчдийн эрх, аюулгүй байдлыг хамгаалах зорилгоор илчлэж болно.',
    ],
  },
  {
    title: '5. Data Retention & Security',
    titleMn: '5. Хадгалалт ба аюулгүй байдал',
    body: [
      'We retain your information for as long as your account is active or as needed to provide the Service and meet legal obligations.',
      'We use reasonable administrative, technical, and organizational measures to protect your data, including encrypted connections (HTTPS) and secure password storage.',
      'No method of transmission over the Internet is 100% secure. While we strive to protect your information, we cannot guarantee absolute security.',
    ],
    bodyMn: [
      'Таны бүртгэл идэвхтэй байх хугацаанд, мөн Үйлчилгээ үзүүлэх, хууль хяналтын шаардлага биелүүлэхэд шаардлагатай хугацаанд мэдээллийг хадгална.',
      'HTTPS шифрлэлт, нууц үгийг аюулгүй хадгалах зэрэг техник, зохион байгуулалтын арга хэмжээ авдаг.',
      'Интернэтээр дамжуулах ямар ч арга 100% аюулгүй биш тул бид бүрэн аюулгүй байдлыг баталгаажуулж чадахгүй.',
    ],
  },
  {
    title: '6. Your Rights & Choices',
    titleMn: '6. Таны эрх',
    body: [
      'Access and update your profile information within the app.',
      'Request account deletion by contacting us at the email below.',
      'Opt out of non-essential communications where applicable.',
      'Depending on your jurisdiction, you may have additional rights under applicable data protection laws (access, correction, deletion, portability).',
    ],
    bodyMn: [
      'Апп дотор профайлын мэдээллээ харах, шинэчлэх.',
      'Доорх и-мэйлээр холбогдож бүртгэл устгуулах хүсэлт илгээх.',
      'Зайлшгүй бус мэдэгдлээс татгалзах (хэрэгжүүлэх боломжтой тохиолдолд).',
      'Таны оршин суух бүсийн хуулийн дагуу нэмэлт эрх (хандалт, засвар, устгал, шилжүүлэх) байж болно.',
    ],
  },
  {
    title: "7. Children's Privacy",
    titleMn: '7. Хүүхдийн нууцлал',
    body: [
      'Tenkhee Plus is intended for adults (18 years and older). We do not knowingly collect personal information from children under 13 (or under 16 in certain regions). If you believe we have collected such data, please contact us and we will delete it promptly.',
    ],
    bodyMn: [
      'Tenkhee Plus нь насанд хүрэгчдэд (18+) зориулагдсан. Бид 13-аас доош (зарим бүс нутагт 16-аас доош) насны хүүхдээс мэдээлэл цуглуулдаггүй. Ийм мэдээлэл цугласан гэж үзвэл бидэнтэй холбогдоод устгуулна уу.',
    ],
  },
  {
    title: '8. Third-Party Links & Services',
    titleMn: '8. Гуравдагч этгээд',
    body: [
      'The app may link to third-party websites or use third-party payment and media services. Their privacy practices are governed by their own policies. We encourage you to review those policies.',
    ],
    bodyMn: [
      'Апп нь гуравдагч вэб сайт, төлбөр, медиа үйлчилгээ ашиглаж болно. Тэдгээрийн нууцлалын бодлогыг тус тусын нь баримтлахыг зөвлөж байна.',
    ],
  },
  {
    title: '9. Changes to This Policy',
    titleMn: '9. Бодлогын өөрчлөлт',
    body: [
      'We may update this Privacy Policy from time to time. We will post the revised policy on this page and update the “Last updated” date. Continued use of the Service after changes constitutes acceptance of the updated policy.',
    ],
    bodyMn: [
      'Бид энэ бодлогыг цаг хугацааны явцад шинэчилж болно. Шинэчилсэн хувийг энэ хуудсанд байршуулж, “Сүүлд шинэчилсэн” огноог шинэчилнэ. Өөрчлөлтийн дараа үргэлжлүүлэн ашигласнаар та шинэ бодлогыг хүлээн зөвшөөрсөнд тооцогдоно.',
    ],
  },
  {
    title: '10. Contact Us',
    titleMn: '10. Холбоо барих',
    body: [
      'If you have questions about this Privacy Policy or your personal data, contact us at:',
      'Email: privacy@tenkhee.mn',
      'App name: Tenkhee Plus',
      'Developer: Tenkhee Plus',
    ],
    bodyMn: [
      'Энэ бодлого эсвэл хувийн мэдээллийн талаар асуулт байвал холбогдоно уу:',
      'И-мэйл: privacy@tenkhee.mn',
      'Апп: Tenkhee Plus',
      'Хөгжүүлэгч: Tenkhee Plus',
    ],
  },
];

export default function PrivacyPage() {
  const lastUpdated = 'August 12, 2026';

  return (
    <LegalPageShell
      title="Privacy Policy"
      subtitle={`Нууцлалын бодлого · Last updated: ${lastUpdated}`}
    >
      <p className="mb-8 rounded-lg border border-white/10 bg-white/[0.03] p-4 text-sm leading-relaxed text-white/60">
        This page is the official privacy policy URL for the Tenkhee Plus mobile app, submitted to
        Google Play and Apple App Store. It is available publicly at{' '}
        <strong className="text-white">/privacy</strong>.
      </p>

      <div className="space-y-10">
        {sections.map((section) => (
          <section key={section.title}>
            <h2 className="text-lg font-bold text-white">{section.title}</h2>
            <h3 className="mt-1 text-base font-semibold text-[#ff453a]">{section.titleMn}</h3>
            <div className="mt-4 space-y-3 text-sm leading-relaxed text-white/60">
              {section.body.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
            <div className="mt-4 space-y-3 border-l-2 border-[#ff453a]/30 pl-4 text-sm leading-relaxed text-white/80">
              {section.bodyMn.map((paragraph) => (
                <p key={paragraph.slice(0, 40)}>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <div className="mt-16 border-t border-white/10 pt-8 text-center text-sm text-white/50">
        <p className="space-x-4">
          <a href="mailto:privacy@tenkhee.mn" className="text-[#ff453a] hover:underline">
            privacy@tenkhee.mn
          </a>
          <Link href="/support" className="text-[#ff453a] hover:underline">
            Support
          </Link>
        </p>
      </div>
    </LegalPageShell>
  );
}
