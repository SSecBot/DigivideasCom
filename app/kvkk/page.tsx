import type { Metadata } from "next";
import { JsonLd } from "@/components/seo/JsonLd";
import { buildMetadata, CONTACT } from "@/lib/seo/site";
import { breadcrumbSchema } from "@/lib/seo/structured-data";

export const metadata: Metadata = buildMetadata({
  title: "KVKK Aydınlatma Metni & Gizlilik Politikası",
  description:
    "digivideas web sitesinde işlenen kişisel veriler, iletişim formu, çerezsiz ziyaretçi istatistikleri ve 6698 sayılı KVKK kapsamındaki haklarınız hakkında bilgilendirme.",
  path: "/kvkk",
});

const sections: { title: string; body: string[] }[] = [
  {
    title: "1. Veri sorumlusu",
    body: [
      `Bu aydınlatma metni, 6698 sayılı Kişisel Verilerin Korunması Kanunu ("KVKK") kapsamında veri sorumlusu sıfatıyla digivideas (İzmir, Torbalı) tarafından hazırlanmıştır. İletişim: ${CONTACT.email}.`,
    ],
  },
  {
    title: "2. İletişim formu ile toplanan veriler",
    body: [
      "Teklif / iletişim formunu doldurduğunuzda adınız, e-posta adresiniz, telefon numaranız, (varsa) firma adınız, ilgilendiğiniz hizmet ve mesajınız işlenir.",
      "Bu veriler yalnızca talebinize dönüş yapmak, teklif hazırlamak ve sözleşme öncesi görüşmeleri yürütmek amacıyla, KVKK m.5/2-c (sözleşmenin kurulması) ve m.5/2-f (meşru menfaat) hukuki sebeplerine dayanılarak işlenir ve üçüncü kişilere satılmaz.",
    ],
  },
  {
    title: "3. Ziyaretçi istatistikleri (çerezsiz analiz)",
    body: [
      "Sitemizi geliştirmek için kendi sunucumuzda çalışan, çerez kullanmayan bir istatistik sistemi kullanırız. Tarayıcınızda rastgele üretilmiş anonim bir kimlik saklanır; IP adresiniz kaydedilmez.",
      "Toplanan bilgiler: ziyaret edilen sayfa, sayfada geçirilen süre, yönlendiren site, kampanya (UTM) parametreleri, cihaz türü, tarayıcı, işletim sistemi, tarayıcı dili ve WhatsApp/telefon/e-posta bağlantılarına tıklama gibi etkileşimler.",
      "Tarayıcınızda \"Do Not Track\" veya \"Global Privacy Control\" ayarı açıksa hiçbir istatistik gönderilmez. İstatistik kayıtları en fazla 400 gün saklanır.",
    ],
  },
  {
    title: "4. Saklama ve güvenlik",
    body: [
      "Veriler, erişimi şifre ile korunan yönetim paneli üzerinden yalnızca yetkili ekip üyelerince görüntülenir. Silinmesini talep ettiğiniz kayıtlar yönetim panelinden kaldırılır.",
    ],
  },
  {
    title: "5. KVKK m.11 kapsamındaki haklarınız",
    body: [
      "Kişisel verilerinizin işlenip işlenmediğini öğrenme, işlenmişse bilgi talep etme, amacına uygun kullanılıp kullanılmadığını öğrenme, eksik veya yanlış işlenmişse düzeltilmesini, silinmesini veya yok edilmesini isteme ve zarara uğramanız hâlinde giderilmesini talep etme haklarına sahipsiniz.",
      `Başvurularınızı ${CONTACT.email} adresine iletebilirsiniz; talebiniz en geç 30 gün içinde sonuçlandırılır.`,
    ],
  },
];

export default function KvkkPage() {
  return (
    <>
      <JsonLd
        data={breadcrumbSchema([
          { name: "Ana Sayfa", path: "/" },
          { name: "KVKK & Gizlilik", path: "/kvkk" },
        ])}
      />
      <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12 pb-24 space-y-8">
        <header className="space-y-3">
          <p className="text-xs font-mono text-brand-400">Yasal bilgilendirme</p>
          <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
            KVKK Aydınlatma Metni & Gizlilik Politikası
          </h1>
          <p className="text-xs text-zinc-500 font-mono">Son güncelleme: 16 Ekim 2026</p>
        </header>
        {sections.map((section) => (
          <section key={section.title} className="space-y-3">
            <h2 className="text-lg sm:text-xl font-bold text-white">{section.title}</h2>
            {section.body.map((paragraph) => (
              <p key={paragraph} className="text-sm sm:text-base text-zinc-300 leading-relaxed">
                {paragraph}
              </p>
            ))}
          </section>
        ))}
      </article>
    </>
  );
}
