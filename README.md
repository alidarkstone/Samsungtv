# Sade Ekran

Samsung (Tizen / One UI) TV için reklamsız, minimal uygulama başlatıcı.
Saat, tarih, favoriler ve TV'de kurulu uygulamaların listesi — başka hiçbir şey yok.

## Kumanda

| Tuş | İşlev |
| --- | --- |
| Yön tuşları | Gezin |
| OK | Uygulamayı aç |
| Yeşil | Favorilere ekle / çıkar |
| Geri | Listenin başına dön |

## Kurulum (TV ile aynı ağdaki bir bilgisayardan)

1. TV: **Apps** ekranında kumandadan `12345` yaz → Developer mode **On**, Host PC IP = bilgisayarının IP'si → TV'yi kapat/aç.
2. Bilgisayar: [Tizen Studio](https://developer.tizen.org/development/tizen-studio/download) + *TV Extensions* ve *Samsung Certificate Extension* kur.
3. Certificate Manager'da Samsung sertifikası oluştur (Samsung hesabı ister, TV'nin DUID'si eklenmeli).
4. Kur:

```sh
sdb connect 192.168.50.118
tizen package -t wgt -s <sertifika-profili> -- app
tizen install -n "Sade Ekran.wgt" -t <cihaz-adı> -- app
```

## Açılışta otomatik gelsin

TV: **Ayarlar → Genel → Akıllı Özellikler → Son Uygulamayı Otomatik Çalıştır** = Açık.
TV'yi bu uygulama açıkken kapatırsan açılışta Samsung ana ekranı yerine bu gelir.

## Sınırlar

- Samsung'un kendi ana ekranı kaldırılamaz; Home tuşuna basınca yine o açılır.
- Ana ekran reklamlarını azaltmak için router'da DNS engelleme (AdGuard DNS / Pi-hole) kullanılabilir.
- Geliştirici sertifikasıyla kurulan uygulamaların süresi dolabilir; dolunca yeniden kurmak gerekir.

## Önizleme

`app/index.html` dosyasını tarayıcıda aç (örnek uygulama listesiyle çalışır, favori tuşu `F`).
