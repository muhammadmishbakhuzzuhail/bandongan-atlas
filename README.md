# Atlas Geography

Frontend geographic infographic untuk menguji boundary GeoJSON, interaksi MapLibre, overlay warna wilayah, dan dialog statistik yang dapat dibuka melalui peta, pencarian, atau daftar.

## Development

```bash
npm install
npm run dev
```

Open [http://localhost:3001](http://localhost:3001).

Useful checks:

```bash
npm run lint
npm run typecheck
npm run build
```

## GeoJSON

Target boundary Bandongan berada di:

```text
/public/geojson/bandongan-villages.geojson
```

File ini sekarang berisi 14 polygon desa yang diambil dari layer batas desa BIG untuk filter `WADMKC = Bandongan`. Geometry diturunkan dari respons resmi tersebut dan diringankan untuk rendering web; properties aplikasi dinormalisasi tanpa memasukkan data statistik ke dalam GeoJSON. BIG menandai sumbernya sebagai `Batas Indikatif`, sehingga file ini tidak boleh diperlakukan sebagai penetapan batas hukum final.

Sumber geometry: [BIG BATAS_DESAKEL_AR](https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_DESAKEL_AR/MapServer/0). Daftar kode/nama desa dapat dicocokkan dengan [Pusaka Kabupaten Magelang](https://pusaka.magelangkab.go.id/sapta-cipta/vdk/list-desa/14).

Konteks Kabupaten Magelang berada di:

```text
/public/geojson/magelang-districts.geojson
```

File konteks berisi 21 kecamatan Kabupaten Magelang dari [BIG BATAS_KECAMATAN_AR](https://geoservices.big.go.id/rbi/rest/services/BATASWILAYAH/BATAS_KECAMATAN_AR/MapServer/0) dengan filter kode `33.08.*`. Geometry digeneralisasi oleh layanan BIG untuk kebutuhan overview web. Bandongan diberi `role: "focus"`, sedangkan 20 kecamatan lain diberi `role: "context"`. Kode Kota Magelang `33.71.*` tidak disertakan. Kecamatan konteks tampil putih dan berlabel, tetapi statistik serta interaksi tetap khusus desa Bandongan dari `bandongan-villages.geojson`.

Untuk pengujian integrasi, repository juga menyimpan:

```text
/public/geojson/demo-nyc-boroughs.geojson
```

File demo ini berisi lima boundary borough New York City dari dataset resmi [City of New York Borough Boundaries](https://catalog.data.gov/dataset/borough-boundaries). Geometry `MultiPolygon` disimpan dari sumber asli; properties dinormalisasi agar cocok dengan join aplikasi:

```json
{
  "id": "brooklyn",
  "name": "Brooklyn",
  "slug": "brooklyn"
}
```

Untuk demo NYC, citra di luar kota ditutup dengan inverse mask yang dibentuk dari:

```text
/public/geojson/nyc-city-boundary.geojson
```

File tersebut memakai geometry resmi [Borough Boundaries (water areas included)](https://data.cityofnewyork.us/City-Government/Borough-Boundaries-water-areas-included-/wh2p-dxnf) dari NYC Department of City Planning. Geometry sumber tidak diubah; aplikasi hanya membentuk polygon turunan `world - NYC` untuk layer putih di luar kota. Overlay borough tetap memakai boundary daratan agar warna wilayah tidak menutupi area air secara berlebihan.

Dataset aktif dipilih di [`src/data/datasets.ts`](src/data/datasets.ts). Saat ini `bandonganDataset` aktif dengan initial/reset view ke Bandongan, batas navigasi seluruh Kabupaten Magelang, mask putih di luar Bandongan, dua mode tampilan, label kecamatan, hover, click, pencarian, selected state, dan dialog statistik. `demoNycDataset` tetap tersedia sebagai fixture untuk menguji geometry `MultiPolygon`, mask, dan kamera terkunci.

Setiap feature minimal harus memiliki properties berikut:

```json
{
  "type": "Feature",
  "properties": {
    "id": "bandongan",
    "name": "Bandongan",
    "slug": "bandongan"
  },
  "geometry": {
    "type": "Polygon",
    "coordinates": []
  }
}
```

Geometry `Polygon` dan `MultiPolygon` didukung. Untuk geometry yang benar-benar valid, `coordinates` harus berisi ring/coordinate resmi; contoh di atas hanya menjelaskan bentuk properties dan bukan boundary yang dapat dirender.

ID dari `properties.id` atau `properties.slug` harus sesuai dengan `id` di dataset statistik aktif. Jika GeoJSON menyediakan titik label, aplikasi akan memakai `labelCoordinates` / `label_coordinates` atau pasangan `labelLon` + `labelLat`; bila tidak, aplikasi menghitung approximate center dari geometry.

## Data statistik

`src/data/villages.ts` menyimpan join statistik Bandongan. Baseline populasi memakai [Kecamatan Bandongan Dalam Angka 2024](https://magelangkab.bps.go.id/id/publication/2024/09/26/450ae2f8e7cdaa54da17f268/kecamatan-bandongan-dalam-angka-2024.html) dengan periode data 2023. Field desa yang belum berhasil dikonfirmasi dari tabel resmi dibiarkan `null` dan ditampilkan sebagai `N/A`; aplikasi tidak mengisi angka estimasi. `src/data/demo-villages.ts` tetap berisi angka ilustratif NYC untuk fixture dan ditandai `dataStatus: "illustrative"`.

Geometry dan statistik sengaja dipisahkan: MapLibre hanya menerima boundary GeoJSON, sedangkan dialog infographic melakukan join berdasarkan village ID. Polygon memiliki label, legend, hover state, selected state, dan warna soft yang dihitung dari adjacency graph sehingga wilayah yang berdampingan tidak memiliki warna sama. GeoJSON Polygon dan MultiPolygon sama-sama didukung.

Dataset NYC memakai `interactionMode: "locked"`: camera otomatis fit ke batas kota, lalu drag, scroll zoom, double-click zoom, keyboard zoom, rotate, dan touch navigation dinonaktifkan. Klik polygon tetap aktif dan membuka dialog statistik yang di-anchor dekat titik label polygon; kamera tidak ikut berpindah ketika wilayah dipilih.

## Basemap dan overlay

Aplikasi memakai citra satelit dengan dua mode tampilan:

- Basemap: raster imagery [Esri World Imagery](https://developers.arcgis.com/maplibre-gl-js/maps/raster-tile-basemaps/display-multiple-basemap-layers/).
- `Warna desa`: overlay adjacency-aware dengan fill dan garis 40% pada kondisi normal, 60% saat hover, serta 70% saat dipilih.
- `Citra satelit`: fill warna disembunyikan, tetapi batas, label, hover, click, dan dialog desa tetap aktif.
- Di luar Kecamatan Bandongan: inverse mask putih.
- Dua puluh kecamatan Kabupaten Magelang lainnya: putih, hanya garis batas dan label, serta tidak interaktif.
- Kamera dimulai dan di-reset ke Bandongan; pan dan zoom-out dibatasi oleh bounds seluruh Kabupaten Magelang.

Attribution Esri selalu ditampilkan. Endpoint imagery ini dipakai untuk development/testing; review terms, quota, dan kebutuhan token sebelum deployment production. Panduan attribution Esri tersedia [di sini](https://support.esri.com/en-us/knowledge-base/what-is-the-correct-way-to-cite-an-arcgis-online-basema-000012040).

## Arsitektur singkat

- `src/app` — App Router shell dan global styles.
- `src/components/map` — MapLibre source/layers, focus mask, konteks kecamatan, legend, hover tooltip, dialog statistik, dan map controls.
- `src/components/village` — search dan list desa.
- `src/data` — konfigurasi dataset dan data statistik statis; geometry tetap berada di `public/geojson`.
- `src/lib` — parsing GeoJSON, bounds/label helpers, focus mask, adjacency-aware colors, formatter, dan map constants.
- `src/hooks` — state selection terpusat dengan optional `?village=...` URL state.
