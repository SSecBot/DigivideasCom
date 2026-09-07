# Digivideas — Hosting Seçimi ve Adım Adım Kurulum Rehberi (DEPLOYMENT GUIDE)

Bu rehber, **hiç teknik veya sunucu bilgisi olmayan birisinin dahi** `digivideas` web sitesini ve yönetim panelini internette yayına (canlıya) sorunsuz bir şekilde alabilmesi için en ince ayrıntısına kadar sade bir dille hazırlanmıştır.

---

## 📌 1. Önemli Giriş: Bu Site Ne Tür Bir Altyapıya Sahiptir?

Bu web sitesi, geleneksel eski tip PHP/WordPress sitelerinden farklı olarak dünyanın en gelişmiş modern web teknolojilerinden biri olan **Next.js 14 (React & TypeScript)** altyapısıyla geliştirilmiştir.

### ⚠️ En Önemli Kural:
- Standart, sadece PHP/MySQL çalıştıran ucuz klasik hostinglerde doğrudan **çalışmaz**.
- Sitenin çalışabilmesi için sunucuda **Node.js** (Sürüm 18 veya 20+) çalışma ortamının bulunması gerekir.

---

## 🏢 2. Hangi Tür Hosting Almalısınız? (Seçenekler & Karşılaştırma)

| Hosting Türü | Zorluk Derecesi | Aylık Maliyet | Tavsiye Edilen Sağlayıcılar | Kimler İçin Uygun? |
|---|---|---|---|---|
| **1. Modern Bulut Hosting (Serverless PaaS)** | ⭐ (Çok Kolay - 2 Dakika) | **0 ₺ - Ücretsiz** (veya cüzi) | **Vercel**, Netlify, Render | **En Çok Tavsiye Edilen.** Sıfır sunucu bilgisi gerektirir. |
| **2. cPanel / Plesk Hosting (Node.js Destekli)** | ⭐⭐⭐ (Orta) | 100 ₺ - 300 ₺ / Ay | Turhost, Natro, Güzel Hosting, Hostinger | Klasik panel alışkanlığı olanlar için. |
| **3. VPS / VDS Bulut Sunucu (Linux Ubuntu)** | ⭐⭐⭐⭐ (İleri Seviye) | 150 ₺ - 400 ₺ / Ay | DigitalOcean, Hetzner, AWS, Linode | Tam kontrol ve kendi bağımsız sunucusunu yönetmek isteyenler. |
| **4. Statik HTML Çıktısı (Her Türlü Hosting)** | ⭐⭐ (Kolay) | 50 ₺ - 150 ₺ / Ay | Herhangi bir web hosting firması | Basit FTP ile dosya atmak isteyenler. |

---

## ⚙️ 3. Hostingin Sahip Olması Gereken Minimum Özellikler

Eğer bağımsız bir hosting veya sunucu kiralayacaksanız, aşağıdaki özelliklerin sağlandığından emin olun:

- **Node.js Desteği:** Node.js **v18.17.0+** veya **v20.x LTS** (Kesinlikle gereklidir).
- **Bellek (RAM):** Minimum **1 GB RAM** (Derleme ve akıcı çalışma için **2 GB RAM** önerilir).
- **İşlemci (CPU):** Minimum **1 Core (vCPU)**.
- **Disk Alanı:** Minimum **5 GB SSD / NVMe** depolama alanı.
- **SSL Sertifikası:** Ücretsiz **Let's Encrypt SSL (HTTPS)** desteği.
- **İşletim Sistemi (VPS için):** **Ubuntu 22.04 LTS** veya **Debian 12**.

---

## 🚀 4. Adım Adım Kurulum Yöntemleri

---

### 🥇 YÖNTEM 1: Vercel ile 2 Dakikada Kurulum (En Kolay ve Şiddetle Önerilen)

Next.js teknolojisini geliştiren şirket olan **Vercel**, bu site için en hızlı, en güvenli ve en yüksek performanslı platformdur. Kendi alan adınızı (domain) ücretsiz bağlayabilirsiniz.

#### Adım 1: GitHub Hesabınıza Projeyi Yükleyin
1. [github.com](https://github.com) adresine gidin ve ücretsiz bir hesap açın.
2. Sağ üstten **"New Repository"** (Yeni Depo) diyerek `digivideas-website` adında özel (private) veya herkese açık bir depo oluşturun.
3. Proje klasöründeki dosyaları bu depoya yükleyin (veya terminalden `git push` yapın).

#### Adım 2: Vercel'e Bağlanın
1. [vercel.com](https://vercel.com) adresine gidin ve **"Sign Up with GitHub"** seçeneğiyle giriş yapın.
2. Karşınıza gelen ekranda **"Add New..." -> "Project"** butonuna tıklayın.
3. GitHub'a yüklediğiniz `digivideas-website` projesini listeden seçin ve **"Import"** deyin.

#### Adım 3: Tek Tıkla Canlıya Alma (Deploy)
1. **Framework Preset:** `Next.js` olarak otomatik algılanacaktır.
2. Başka hiçbir ayara dokunmadan en alttaki **"Deploy"** butonuna basın.
3. Yaklaşık 45-60 saniye içinde siteniz dünya çapında CDN üzerinde yayına girecektir! 🎉

#### Adım 4: Kendi Domain Adınızı (Örn: digivideas.com) Bağlama
1. Vercel panelinizde projenizin içine girin -> **Settings** -> **Domains** sekmesine tıklayın.
2. `digivideas.com` ve `www.digivideas.com` yazıp **Add** deyin.
3. Vercel size 2 adet DNS kaydı verecektir (Genelde 1 adet `A Record` ve 1 adet `CNAME`).
4. Domaini satın aldığınız firmanın (GoDaddy, Natro, İsimtescil vb.) DNS yönetim paneline girip bu değerleri ekleyin. Birkaç dakika içinde siteniz alan adınızla açılacaktır.

---

### 🥈 YÖNTEM 2: cPanel Üzerinde Node.js ile Kurulum (Türk Hosting Firmaları)

Eğer yerli bir hosting firmasından (Turhost, Natro, Güzel Hosting vb.) cPanel hizmeti aldıysanız:

#### Adım 1: cPanel'de Node.js Desteğini Kontrol Edin
- cPanel ana sayfasına girin ve **"Yazılım" (Software)** bölümü altında **"Setup Node.js App"** seçeneğinin olduğunu teyit edin. (Yoksa firmanızla görüşüp Node.js desteği açtırın).

#### Adım 2: Node.js Uygulaması Oluşturun
1. **"Setup Node.js App"** -> **"Create Application"** butonuna tıklayın.
2. **Node.js Version:** `18.x` veya `20.x` seçin.
3. **Application Mode:** `Production` yapın.
4. **Application Root:** Sitenin dosyalarının bulunacağı klasör adı (örn: `digivideas_app`).
5. **Application URL:** Alan adınızı seçin (`digivideas.com`).
6. **Application Startup File:** `server.js` veya `node_modules/next/dist/bin/next` (veya `npm start`).
7. **"Create"** butonuna tıklayın.

#### Adım 3: Dosyaları Sunucuya Yükleyin
1. Bilgisayarınızdaki proje klasöründen `.next` ve `node_modules` klasörleri **HARİÇ** tüm dosyaları bir ZIP haline getirin.
2. cPanel **Dosya Yöneticisi (File Manager)** ile yukarıda oluşturduğunuz `digivideas_app` klasörünün içine yükleyip ZIP'i açın.

#### Adım 4: Paketleri Kurun ve Derleyin
1. cPanel Node.js sayfasına geri dönün.
2. Sayfanın altındaki **"Run NPM Install"** butonuna basarak kütüphanelerin yüklenmesini sağlayın.
3. Terminal veya SSH üzerinden klasöre girip `npm run build` komutunu çalıştırın.
4. Sayfanın üst kısmındaki **"Restart"** butonuna basarak sitenizi yayına alın.

---

### 🥉 YÖNTEM 3: Kendi VPS / VDS Linux Sunucunuza Kurulum (Ubuntu 22.04)

Tamamen bağımsız bir sanal sunucu (Hetzner, DigitalOcean, Natro VDS vb.) kiraladıysanız, SSH terminalinden sırasıyla aşağıdaki komutları çalıştırarak kurulumu tamamlayabilirsiniz:

```bash
# 1. Sunucu paketlerini güncelleyin
sudo apt update && sudo apt upgrade -y

# 2. Node.js 20 LTS ve Git yükleyin
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs git nginx

# 3. PM2 Süreç Yöneticisini kurun (Sitenin arka planda sürekli çalışması için)
sudo npm install -g pm2

# 4. Projenizi sunucuya çekin (veya SFTP ile /var/www/digivideas klasörüne atın)
sudo mkdir -p /var/www/digivideas
cd /var/www/digivideas
# (Dosyaları buraya yükledikten sonra)

# 5. Bağımlılıkları yükleyin ve derleyin
npm install
npm run build

# 6. PM2 ile projeyi başlatın
pm2 start npm --name "digivideas" -- start
pm2 save
pm2 startup

# 7. Nginx yapılandırması (Gelen istekleri Next.js portuna yönlendirme)
sudo nano /etc/nginx/sites-available/digivideas
```

Nginx dosyasına şunu yapıştırın:
```nginx
server {
    server_name digivideas.com www.digivideas.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}
```

Nginx'i aktifleştirip ücretsiz SSL kurun:
```bash
sudo ln -s /etc/nginx/sites-available/digivideas /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx

# 8. Ücretsiz Let's Encrypt SSL Kurulumu
sudo apt install certbot python3-certbot-nginx -y
sudo certbot --nginx -d digivideas.com -d www.digivideas.com
```

---

## 🔒 5. Canlı Ortamda Yönetim Paneli Güvenliği

- Sitenin gizli yönetim paneli adresi: `https://alanadiniz.com/dashboard/admin/digivideas`
- Varsayılan Giriş Şifresi: `MuazDigivideas285561.`
- Bu şifre ve oturum mekanizması, istemci tarafında güvenli tarayıcı oturumu (`sessionStorage`) ile korunmaktadır.

---

## ❓ 6. Sıkça Sorulan Sorular (SSS)

### S: En ucuz ve en sorunsuz yöntem hangisidir?
**C:** Kesinlikle **Vercel** yöntemidir. Başlangıç paketi tamamen **ücretsizdir**, SSL otomatik tanımlanır, sunucu çökmesi veya bakım derdi yoktur.

### S: Sitede yeni bir müşteri hikayesi veya hizmet eklediğimde sunucuyu yeniden başlatmam gerekir mi?
**C:** Hayır! Yönetim paneli üzerinden (`/dashboard/admin/digivideas`) eklediğiniz veya düzenlediğiniz tüm içerikler tarayıcıda anında ve dinamik olarak güncellenir.

### S: Kaynak kodlarda güncelleme yaptığımda canlı siteye nasıl yansır?
- **Vercel kullanıyorsanız:** GitHub'a kod yüklediğiniz an 30 saniye içinde otomatik olarak canlıya geçer (Sıfır kesinti).
- **VPS kullanıyorsanız:** Sunucuda `git pull && npm run build && pm2 restart digivideas` komutunu çalıştırmanız yeterlidir.
