import React, { useState, useEffect } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  CircleMarker,
  Polyline, // Import Polyline for drawing routes
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import DayPlanPopup from './DayPlanPopup'; // Import the new DayPlanPopup component
import DayPlanSidebar from './DayPlanSidebar';
// Fix default Leaflet icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

// Category colors (as defined in the original HTML)
const colors = {
  "museums": "#2E8B57",   // green
  "shops": "#1E90FF",     // blue
  "food": "#FF8C00",      // orange
  "bazaars": "#8A2BE2",   // purple
  "malls": "#DC143C",     // red
  "attractions": "#008B8B",// darkcyan
  "other": "#666666"      // gray
};

// Emoji icons for highlights
function makeEmojiIcon(emoji) {
  return L.divIcon({
    className: "emoji-icon",
    html: `<div style="font-size:24px;">${emoji}</div>`,
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
}

// All places data with added unique 'id' properties
const placesData = [
  // --- SPECIAL: Taksim (home icon) ---
  { id: "taksim_square", lat: 41.0369, lon: 28.9860, title: "Taksim Square (Taksim) — Special", category: "other", html: "<em>Central hub — Istiklal, hotels, shopping</em>", icon: makeEmojiIcon("🏠") },
  // --- SPECIAL: Laleli ---
  { id: "laleli", lat: 41.0103, lon: 28.9578, title: "Laleli (textile / wholesale area)", category: "shops", html: "Laleli district — textile wholesalers, shops, hotels near tram.", icon: makeEmojiIcon("📍") },
  { id: "ortakoy", lat: 41.047537, lon: 29.025775, title: "Ortakoy square", category: "shops", html: "Ortakoy district — shops, cafes, and the famous mosque. KAMPIR / KES GHALA", icon: makeEmojiIcon("📍") },
  // --- SPECIAL: Eminönü ---
  { id: "eminonu", lat: 41.0172, lon: 28.9711, title: "Eminönü (ferry & bazaars)", category: "bazaars", html: "Eminönü ferry hub, Spice Bazaar, access to Old City.", icon: makeEmojiIcon("📍") },
 { id: "shaba", lat: 41.030139, lon: 28.949909, title: "Colorful Stairs /umbrellas", category: "bazaars", html: "s7ayeb mlawna.", icon: makeEmojiIcon("📸") },
 { id: "buil", lat: 41.029578, lon: 28.949091, title: "Colorful buildings", category: "bazaars", html: "s7ayeb mlawna.", icon: makeEmojiIcon("📸") },
 { id: "shabaf", lat:41.024624, lon: 28.978342, title: "Umbrella Street (fake)", category: "bazaars", html: "s7ayeb mlawna.", icon: makeEmojiIcon("📸") },
 { id: "shabaf", lat:41.023897, lon: 28.973675, title: "Escaliers Camondo ", category: "bazaars", html: "(drouj mezyen).", icon: makeEmojiIcon("📸") },
 { id: "shabaf", lat:41.025528, lon: 28.974139, title: "Galata port ", category: "bazaars", html: "(drouj mezyen).", icon: makeEmojiIcon("📸") },
  // --- Kadıköy & Asian Side ---
  { id: "kadikoy_cilek_sokak", lat: 40.990415, lon: 29.030519, title: "Kadıköy - Çilek Sokak (Çilek Street)", category: "shops", html: "Cheap street shopping, many small boutiques. Near Söğütlüçeşme metro." },
  { id: "bahariye_street", lat: 40.990194, lon: 29.029016, title: "Bahariye Street (Kadıköy)", category: "shops", html: "Bahariye shopping & cafes." },
  { id: "tepe_nautilus_mall", lat: 40.998965, lon: 29.030959, title: "Tepe Nautilus Mall (Ayrılıkçeşmesi)", category: "malls", html: "Tepe Nautilus shopping mall." },
  { id: "historia_shopping", lat: 41.014088, lon: 28.944962, title: "Historia Shopping", category: "malls", html: "Historia shopping mall." },
  { id: "merter", lat: 41.009022, lon: 28.886885, title: "Merter (Textile District)", category: "shops", html: " Maaredh Merter district — textile wholesalers, shops." },
  { id: "akasya_avm", lat: 41.002142, lon: 29.054086, title: "Akasya AVM MALL(Acıbadem / Üsküdar area)", category: "malls", html: "Akasya shopping mall (Asian side)." },
  { id: "mi_so", lat: 40.9918, lon: 29.0259, title: "Mi&So (Kadıköy mention)", category: "shops", html: "Local shop mentioned: Mi&So." },
  { id: "vadis", lat: 41.107356, lon: 28.986055, title: "Vadistanbul Mall", category: "malls", html: "Vadistanbul shopping mall." },
  // --- Beyoğlu / Istiklal / Çare3 iste9lel area ---
  { id: "istiklal_caddesi", lat: 41.0368, lon: 28.9851, title: "Istiklal Caddesi (İstiklal Street)", category: "shops", html: "Historic shopping street, boutiques, cafés." },
  { id: "beyoglu_shopping_streets", lat: 41.0362, lon: 28.9855, title: "Beyoğlu shopping streets (BSL, Disponible, Maya, Mira etc.)", category: "shops", html: "Small boutiques & shops referenced in your list." },
  { id: "capone_outfit", lat: 41.0129, lon: 28.9734, title: "Capone outfit / Mimar Kemalettin area (Beyazıt)", category: "shops", html: "Mimar Kemalettin Mahallesi — Capone outfit shop (Beyazıt area)." },

  // --- Beşiktaş / Sinanpaşa / Levent / Kanyon ---
  { id: "besiktas_levent_sinanpasa_malls", lat: 41.0434, lon: 29.0058, title: "Beşiktaş / Levent / Sinanpaşa — malls & shops", category: "malls", html: "Mall Beşiktaş, Sinanpaşa mall references, Kanyon (Levent)." },
  { id: "kanyon_mall", lat: 41.078448, lon: 29.010243, title: "Kanyon Mall (Levent)", category: "malls", html: "Kanyon — high-end mall." },

  // --- Bakırköy / Olivium / Büyük Bakırköy Pazarı ---
  { id: "bakirkoy", lat: 40.980921, lon: 28.875748, title: "Bakırköy ", category: "shops", html: "Bakırköy district — shopping area, restaurants, cafes.", icon: makeEmojiIcon("📍") },
  { id: "olivium_outlet", lat: 40.995556, lon: 28.908877, title: "Olivium Outlet (Zeytinburnu)", category: "malls", html: "Olivium Outlet Center. bus 93t taksim direct mall " },
 { id: "marmara_forum", lat: 40.996757, lon: 28.887341, title: "Marmara Forum Mall", category: "malls", html: "Marmara Forum Mall." },
  // --- Florya / Wednesday Pazar Florya ---
  { id: "florya_wednesday_pazar", lat: 40.9806, lon: 28.7817, title: "Florya — Wednesday Pazar", category: "bazaars", html: "Weekly market in Florya area." },
 { id: "aqua_florya_mall", lat: 40.965822, lon: 28.798495, title: "Aqua Florya Mall", category: "malls", html: "Aqua Florya Mall." },
  // --- Ümraniye street shops ---
  { id: "umraniye_street_shopping", lat: 41.0131, lon: 29.0879, title: "Ümraniye — Street shopping", category: "shops", html: "Ümraniye shopping street cluster." },

  // --- Outlet 212 (Başakşehir) & Vinzya / Venezia mall approximate ---
  { id: "outlet_212", lat: 41.047724, lon: 28.808697, title: "Outlet 212 (Başakşehir)", category: "malls", html: "Large outlet mall." },
  { id: "venezia_mega_outlet", lat: 41.079294, lon: 28.876422, title: "Venezia Mega Outlet", category: "malls", html: "Venezia Mega Outlet." },

  // --- Miniatürk, Istanbul Modern, Illusion Museum, Chocolate City, Tema World, Astra Lumina ---
  { id: "miniaturk", lat: 41.0506, lon: 28.9636, title: "Miniatürk (Miniature Park)", category: "museums", html: "Miniature models of landmarks." },
  { id: "istanbul_modern", lat: 41.0236, lon: 28.9732, title: "Istanbul Modern (Karaköy)", category: "museums", html: "Contemporary art museum." },
  { id: "illusion_museum", lat: 41.0365, lon: 28.9850, title: "Illusion Museum (Taksim area)", category: "museums", html: "Interactive illusions." },
  { id: "chocolate_museum", lat: 41.058902, lon: 28.663632, title: "Chocolate Museum", category: "museums", html: "Chocolate-themed attraction. 300 lira." },
  { id: "tema_world", lat: 41.055973, lon: 28.771233, title: "Tema World (theme park / attraction)", category: "attractions", html: "Large family attraction / theme park." },
  { id: "astra_lumina", lat: 41.0150, lon: 28.9800, title: "Astra Lumina (experience)", category: "attractions", html: "Immersive light show (approx)." },

  // --- Eskişehir (day-trip) ---
  { id: "eskisehir", lat: 39.7767, lon: 30.5206, title: "Eskişehir (day-trip) — zoo + VR experiences", category: "attractions", html: "Outside Istanbul: Eskişehir attractions." },

  // --- Kale Outlet Center & other Outlets ---
  { id: "kale_outlet_center", lat: 41.015457, lon: 28.877019, title: "Kale Outlet Center (approx)", category: "malls", html: "Outlet center (approx)." },
{ id: "opt", lat: 40.988342, lon: 29.085285, title: "Optimum premium Mall", category: "malls", html: "Outlet center (approx)." },
{ id: "emaar_mall", lat: 41.003358, lon: 29.069682, title: "Emaar Mall", category: "malls", html: "Outlet center (approx)." },
{ id: "merzezi", lat: 41.031587, lon: 28.976092, title: "Beyoğlu İş Merkezi", category: "malls", html: "rue taksim close to yves rocher" },
  // --- Boutiques & jewellery grouped marker (VC, Aron, Black Tree, Agucino, etc.) ---
  { id: "boutiques_jewellery", lat: 41.049012, lon: 28.994021, title: "BSL", category: "shops", html: "Street boutiques " },

  // --- Food & Markets (grouped markers for many food items) ---
  { id: "food_markets", lat: 41.0120, lon: 28.9750, title: "Food & Markets (BIM, Pide, Döner, BOAC tiramisu, Kampir ArtaKoy)", category: "food", html: "<ul><li>BIM market (cheap groceries)</li><li>Kampir ArtaKoy</li><li>Pide & Döner spots</li><li>BOAC tiramisu cup</li></ul>" },
{ id: "boac", lat: 40.984519, lon: 29.027705, title: "BOAC tiramisu", category: "food", html: "Tiramisu cup" },
{ id: "avo", lat: 41.018364, lon: 28.946328, title: "Avocado", category: "food", html: "Patissrie jus" },
{ id: "mendel", lat: 41.042790, lon: 29.002513, title: "Mendel's ", category: "food", html: "Patissrie 250TL" },
{ id: "bombaci", lat: 41.041695, lon: 29.004094, title: "Bombaci Fatih", category: "food", html: "k3aber chokolat" },
{ id: "kyo", lat: 41.051538, lon: 28.987623, title: "KYO matcha", category: "food", html: "matcha" },
{ id: "tea", lat: 41.044152, lon: 29.003932, title: "Tea taste", category: "food", html: "korean cute mocha" },
  // --- Weekly bazaars & markets cluster ---
  { id: "weekly_bazaars_markets", lat: 40.995819, lon: 28.876277, title: "Bakirkoy baazar", category: "bazaars", html: "thursday saturday sunday" },
 { id: "Florya", lat: 40.964493, lon: 28.816671, title: "Florya/Yeşilköy Pazarı", category: "bazaars", html: "Kuma Pazarı (Fri), Kadıköy bazaars (Tue & Fri), weekly bazaars." },
  // --- Ayakkabı fabrikası (shoe factory outlets area) ---
  { id: "ayakkabi_fabrikasi", lat: 40.996977, lon: 28.605849, title: "Ayakkabı fabrikası (shoe factory outlets)", category: "shops", html: "Grouped shoe factory / outlet shops (approx)." },

  // --- Karma (gift shop) — Sulaymaniyah reference (grouped in Fatih / Süleymaniye) ---
  { id: "karma_gift_shop", lat: 41.017036, lon: 28.966726, title: "Karma (gift shop) — Süleymaniye area", category: "shops", html: "Karma — gifts, Süleymaniye area." },
{ id: "sak_han", lat: 41.015065, lon: 28.968253, title: "Sak han ", category: "shops", html: "gifts + accessoires" },
  // --- eSIM (Airalo / Holafly / byteSIM) grouped in airport / central kiosk marker ---

  // --- Kadikoy Bazaar (Tue & Fri) explicit marker included above; add Kadikoy bazar (3rd & Fri) mention ---
  { id: "kadikoy_bazaar_note", lat: 40.998123, lon: 29.049846, title: "Kadikoy Bazaar (Tue / Fri) — extra note", category: "bazaars", html: "Kadikoy bazaar details." },

  // --- Additional specific shops & local mentions that were in the list but ambiguous: put neighborhood markers for them ---
  { id: "sinanpasa_central_mall", lat: 41.0438, lon: 29.0049, title: "Sinanpaşa / central mall (low prices)", category: "malls", html: "Sinanpaşa mall area (low-price shopping)." },
  { id: "dcollection_avcilar", lat: 40.9881, lon: 28.7096, title: "DCollection (Avcılar) - shop", category: "shops", html: "DCollection (Avcılar) - grouped marker." },
  { id: "fatih_carsamba_pazari", lat: 41.020993, lon: 28.952551, title: "Fatih Pazarı (Wednesday Market)", category: "bazaars", html: "Istanbul's largest weekly outdoor market for produce, textiles, and goods (Wednesdays only)." },
  { id: "kaya", lat: 40.989482, lon: 29.032010, title: "Cetinkaya (Kadıköy)", category: "shops", html: "Cetinkaya (Kadıköy) - ar5es fi kadikoy." },
  // --- Full raw items from the list, grouped ---
  
];


// Helper function to find place details by ID
const getPlaceById = (id) => placesData.find(p => p.id === id);

// --- ITINERARY DATA ---
const HOTEL_LOCATION = { id: "taksim_square", coords: [41.0369, 28.9860], title: "Your Hotel (Taksim Square)" }; // Your 'home' icon location


const itineraries = [
  {
    day: 1,
    date: "Mon 3 Nov",
    name: "Laleli + Aksaray + historiya mall",
    plan: [
      {
        placeId: HOTEL_LOCATION.id,
        activity: "Arrivée à l'hôtel (Taksim) & Enregistrement",
        coords: HOTEL_LOCATION.coords,
        durationHrs: 1.0 // Durée estimée pour l'enregistrement et s'installer
      },
       {
        placeId: "laleli",
        activity: "Shopping à Laleli",
        durationHrs: 6.0, // Dedicate the day to Laleli
        travelTo: {
          mode: "Métro M2 + Tram T1",
          details: "M2 de Taksim à Vezneciler, puis Tram T1 à Laleli.",
          durationMin: 20
        }
      },
       {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Tram T1 + Métro M2",
          details: "T1 de Laleli à Vezneciler, puis M2 à Taksim.",
          durationMin: 20
        }
      }
    ]
  },
  {
    day: 2,
    date: "Tue 4 Nov",
    name: "Kadikoy + cilek sokak + Akasya mall",
    plan: [
      {
        placeId: HOTEL_LOCATION.id,
        activity: "Départ de l'hôtel (Taksim)",
        coords: HOTEL_LOCATION.coords
      },
      {
        placeId: "kadikoy_bazaar_note", // Represents the general Kadikoy Bazaar area
        activity: "Shopping au Bazaar de Kadıköy",
        durationHrs: 3.0,
        travelTo: {
          mode: "Funiculaire F1 + Ferry",
          details: "F1 de Taksim à Kabataş, puis Ferry vers Kadıköy.",
          durationMin: 40
        }
      },
      {
        placeId: "kadikoy_cilek_sokak",
        activity: "Exploration de Çilek Sokak & Bahariye Street",
        durationHrs: 3.0,
        travelTo: {
          mode: "Marche",
          details: "Marche depuis le bazaar de Kadıköy.",
          durationMin: 10
        }
      },
      {
        placeId: "kaya", // Cetinkaya (Kadıköy)
        activity: "Visite de Cetinkaya (Kadıköy) et autres boutiques locales",
        durationHrs: 2.0,
        travelTo: {
          mode: "Marche",
          details: "Marche autour de Kadıköy.",
          durationMin: 5
        }
      },
      {
        placeId: HOTEL_LOCATION.id,
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Métro + Marmaray + Métro + Funiculaire + Marche",
          details: "D'Emaar Mall (Ünalan), M4 à Ayrılık Çeşmesi, Marmaray à Yenikapı, M2 à Taksim, puis marche.",
          durationMin: 35
        }
      }
    ]
  },
  {
    day: 3,
    date: "wed  5 Nov",
    name: " Fatih + Beshiktach",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Départ de l'hôtel (Taksim)", coords: HOTEL_LOCATION.coords },
       {
        placeId: "fatih_carsamba_pazari",
        activity: "Exploration du Marché de Fatih (Çarşamba Pazarı)",
        durationHrs: 4.0,
        travelTo: {
          mode: "Métro M2 + Tram T1",
          details: "M2 de Taksim à Vezneciler, puis Tram T1 jusqu'à Fatih (arrêt Pazartekke).",
          durationMin: 35
        }
      },
      {
        placeId: "sinanpasa_central_mall", // Sinanpaşa / central mall (low prices)
        activity: "Shopping en soirée à Sinanpaşa (Beşiktaş)",
        durationHrs: 3.0,
        travelTo: {
          mode: "Tram T1 + Bus",
          details: "T1 de Fatih à Eminönü, puis bus 28, 28T, 26, 26A, 26B vers Beşiktaş İskele.",
          durationMin: 45
        }
      },
      { placeId: HOTEL_LOCATION.id, activity: "Retour à l'hôtel (Taksim)", travelTo: { mode: "Tram + Métro", details: "De Fatih, tramway puis métro M2 jusqu'à Taksim.", durationMin: 30 } }
    ]
  },
  {
    day: 4,
    date: "Thu 6 Nov",
    name: "Bakırköy + Aqua Florya",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Départ de l'hôtel (Taksim)", coords: HOTEL_LOCATION.coords },
      {
        placeId: "weekly_bazaars_markets", // Bakirkoy baazar
        activity: "Visite du Bakırköy Pazarı",
        durationHrs: 3.0,
        travelTo: {
          mode: "Métro M2 + Marmaray",
          details: "M2 de Taksim à Yenikapı, puis Marmaray à Bakırköy.",
          durationMin: 40
        }
      },
      {
        placeId: "aqua_florya_mall",
        activity: "Shopping et détente à Aqua Florya Mall",
        durationHrs: 4.0,
        travelTo: {
          mode: "Bus 73Y / Taxi",
          details: "De Bakırköy, bus 73Y ou un court trajet en taxi jusqu'à Aqua Florya.",
          durationMin: 20
        }
      },
      { placeId: HOTEL_LOCATION.id, activity: "Retour à l'hôtel (Taksim)", travelTo: { mode: "Bus + Métro + Marmaray", details: "D'Aqua Florya, bus vers une station Marmaray/Métro proche (ex: Florya), puis retour via Marmaray et M2 à Taksim.", durationMin: 60 } }
    ]
  },
  {
    day: 5,
    date: "Fri 7 Nov",
    name: "Merter + kale outlet",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Départ de l'hôtel (Taksim)", coords: HOTEL_LOCATION.coords },
      {
        placeId: "merter",
        activity: "Shopping dans le quartier textile de Merter",
        durationHrs: 3.0,
        travelTo: {
          mode: "Métro M2 + Métro M1A",
          details: "M2 de Taksim à Yenikapı, puis M1A à Merter.",
          durationMin: 30
        }
      },
      {
        placeId: "kale_outlet_center",
        activity: "Shopping au Kale Outlet Center",
        durationHrs: 3.0,
        travelTo: {
          mode: "Métro M1A + Marche",
          details: "M1A de Merter à Güngören/Akıncılar, puis courte marche. Ou taxi direct.",
          durationMin: 15
        }
      },
      { placeId: HOTEL_LOCATION.id, activity: "Retour à l'hôtel (Taksim)", travelTo: { mode: "Tram + Métro", details: "De Venezia, Tramway T4 à Topkapı, puis M2 à Taksim.", durationMin: 50 } }
    ]
  },
  {
    day: 6,
    date: "Sat 8 Nov",
    name: "Venezia + Sinanpaşa",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." },
     {
        placeId: "venezia_mega_outlet",
        activity: "Shopping toute la journée au Venezia Mega Outlet",
        durationHrs: 6.0,
        travelTo: {
          mode: "Métro M2 + Tram T4",
          details: "M2 de Taksim à Topkapı-Ulubatlı, puis Tram T4 à Kiptaş-Venezia (centre commercial attenant).",
          durationMin: 50
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Tram T4 + Métro M2",
          details: "T4 de Kiptaş-Venezia à Topkapı-Ulubatlı, puis M2 à Taksim.",
          durationMin: 50
        }
      }
    ]
  },
  {
    day: 7,
    date: "Sun 9 Nov",
    name: "212 outlet ",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." }
    ,
      {
        placeId: "outlet_212",
        activity: "Shopping toute la journée à l'Outlet 212",
        durationHrs: 6.0,
        travelTo: {
          mode: "Métro M2 + Métro M7 + Bus",
          details: "M2 de Taksim à Mecidiyeköy, M7 à Mahmutbey, puis bus (ex: HT1) ou taxi jusqu'à Outlet 212.",
          durationMin: 60
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Bus + Métro M7 + Métro M2",
          details: "Bus/taxi d'Outlet 212 à Mahmutbey (M7), M7 à Mecidiyeköy, puis M2 à Taksim.",
          durationMin: 60
        }
      }
    ]
  },
  {
    day: 8,
    date: "Mon 10 Nov",
    name: "Beshiktach + Galata port + museum",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." }
    ,
      {
        placeId: "sak_han",
        activity: "Visite de Sak Han pour cadeaux et accessoires (Süleymaniye)",
        durationHrs: 3.0,
        travelTo: {
          mode: "Métro M2 + Tram T1",
          details: "M2 de Taksim à Vezneciler, puis marche courte vers Süleymaniye et Sak Han.",
          durationMin: 25
        }
      },
      {
        placeId: "illusion_museum",
        activity: "Exploration du Musée des Illusions (Taksim)",
        durationHrs: 2.0,
        travelTo: {
          mode: "Tram T1 + Métro M2",
          details: "T1 de Vezneciler à Kabataş ou Eminönü, puis M2 (si applicable) ou remonter vers Taksim.",
          durationMin: 25
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Marche",
          details: "Le Musée des Illusions est dans la zone de Taksim, donc une courte marche.",
          durationMin: 5
        }
      }
    ]
  },
  {
    day: 9,
    date: "Tue 11 Nov",
    name: "Olivium + Zeruj Port AVM",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." }
   ,
      {
        placeId: "olivium_outlet",
        activity: "Shopping toute la journée à l'Olivium Outlet",
        durationHrs: 6.0,
        travelTo: {
          mode: "Métro M2 + Métro M1A",
          details: "M2 de Taksim à Yenikapı, puis M1A à Zeytinburnu (Navette gratuite du centre commercial disponible).",
          durationMin: 40
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Métro M1A + Métro M2",
          details: "M1A de Zeytinburnu à Yenikapı, puis M2 à Taksim.",
          durationMin: 40
        }
      }
    ]
  },
  {
    day: 10,
    date: "Wed 12 Nov",
    name: "Emaar Mall",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." }
    ,
      {
        placeId: "emaar_mall",
        activity: "Shopping toute la journée au Centre Commercial Emaar",
        durationHrs: 6.0,
        travelTo: {
          mode: "Funiculaire F1 + Ferry + Métro M4",
          details: "F1 de Taksim à Kabataş, Ferry vers Kadıköy, puis M4 de Kadıköy à Ünalan (Emaar Mall est connecté).",
          durationMin: 55
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Métro M4 + Ferry + Funiculaire F1",
          details: "M4 d'Ünalan à Kadıköy, Ferry vers Kabataş, puis F1 à Taksim.",
          durationMin: 55
        }
      }
    ]
  },
  {
    day: 11,
    date: "Thu 13 Nov",
    name: "Vadistanbul Mall/ Libre",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Journée libre à Istanbul", html: "Profitez de cette journée pour vous détendre ou explorer à votre guise." }
    ,
      {
        placeId: "vadis", // Vadistanbul Mall
        activity: "Shopping toute la journée au Vadistanbul Mall/ Libre",
        durationHrs: 6.0,
        travelTo: {
          mode: "Métro M2 + Funiculaire F3",
          details: "M2 de Taksim à Seyrantepe, puis Funiculaire F3 direct vers Vadistanbul.",
          durationMin: 35
        }
      },
      {
        placeId: "taksim_square",
        activity: "Retour à l'hôtel (Taksim)",
        travelTo: {
          mode: "Funiculaire F3 + Métro M2",
          details: "F3 de Vadistanbul à Seyrantepe, puis M2 à Taksim.",
          durationMin: 35
        }
      }
    ]
  },
  {
    day: 12,
    date: "Fri 14 Nov",
    name: "Journée Libre",
    plan: [
      { placeId: HOTEL_LOCATION.id, activity: "Going Home",  html: "Temps libre avant le départ de l'aéroport. De Taksim, le bus Havaist est une option directe pour les aéroports IST et SAW." }
    ]
  }
];

export default function MapView() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showLegend, setShowLegend] = useState(false);
  const [activeDay, setActiveDay] = useState(null); // Stores the selected day's plan object
  const [dayRoutes, setDayRoutes] = useState([]); // Stores Leaflet polylines for the active day

  // Effect to fetch routes when activeDay changes
  useEffect(() => {
    if (activeDay) {
      const fetchRoutes = async () => {
        const newRoutes = [];
        for (let i = 0; i < activeDay.plan.length - 1; i++) {
          const startPoint = activeDay.plan[i];
          const endPoint = activeDay.plan[i + 1];

          // Determine start/end coordinates. Use HOTEL_LOCATION if placeId matches.
          const startCoords = startPoint.placeId === HOTEL_LOCATION.id
            ? HOTEL_LOCATION.coords
            : getPlaceById(startPoint.placeId)?.lat
              ? [getPlaceById(startPoint.placeId).lat, getPlaceById(startPoint.placeId).lon]
              : null;

          const endCoords = endPoint.placeId === HOTEL_LOCATION.id
            ? HOTEL_LOCATION.coords
            : getPlaceById(endPoint.placeId)?.lat
              ? [getPlaceById(endPoint.placeId).lat, getPlaceById(endPoint.placeId).lon]
              : null;


          if (startCoords && endCoords && endPoint.travelTo) {
            // OSRM API profiles: 'driving', 'walking', 'cycling'
            // For 'metro', 'tram', 'ferry' we'll just show static text, no actual route calculation via OSRM
            let profile = "walking";
            if (endPoint.travelTo.mode === "car" || endPoint.travelTo.mode === "taxi") {
              profile = "driving";
            } else if (endPoint.travelTo.mode === "walk") {
              profile = "walking";
            }
            // For public transport, OSRM won't give a public transport route, so we only fetch walking/driving.
            // A more advanced solution would use a dedicated public transport API.

            // Only fetch route for driving/walking. For other modes, we'll draw a straight line or handle differently.
            if (profile === "driving" || profile === "walking") {
                const apiUrl = `https://router.project-osrm.org/route/v1/${profile}/${startCoords[1]},${startCoords[0]};${endCoords[1]},${endCoords[0]}?geometries=geojson&overview=full`;

                try {
                  const response = await fetch(apiUrl);
                  const data = await response.json();

                  if (data.routes && data.routes.length > 0) {
                    const route = data.routes[0].geometry.coordinates.map(coord => [coord[1], coord[0]]);
                    newRoutes.push({
                      path: route,
                      mode: endPoint.travelTo.mode,
                      details: endPoint.travelTo.details,
                      durationMin: Math.round(data.routes[0].duration / 60), // Duration in minutes
                      id: `${startPoint.placeId}-${endPoint.placeId}`
                    });
                  }
                } catch (error) {
                  console.error("Error fetching OSRM route:", error);
                  // Fallback: Add a straight line if OSRM fails or for public transport modes
                  newRoutes.push({
                      path: [startCoords, endCoords],
                      mode: endPoint.travelTo.mode,
                      details: endPoint.travelTo.details,
                      durationMin: endPoint.travelTo.durationMin || 0,
                      id: `${startPoint.placeId}-${endPoint.placeId}-fallback`
                  });
                }
            } else {
                 // For public transport modes, just draw a straight line
                 newRoutes.push({
                    path: [startCoords, endCoords],
                    mode: endPoint.travelTo.mode,
                    details: endPoint.travelTo.details,
                    durationMin: endPoint.travelTo.durationMin || 0,
                    id: `${startPoint.placeId}-${endPoint.placeId}-straight`
                 });
            }
          }
        }
        setDayRoutes(newRoutes);
      };
      fetchRoutes();
    } else {
      setDayRoutes([]); // Clear routes if no active day
    }
  }, [activeDay]); // Rerun when activeDay changes

  // Helper to get place details by ID (including the hotel)
  const getPlaceDetails = (id) => {
    if (id === HOTEL_LOCATION.id) {
      return { ...HOTEL_LOCATION, category: "other" }; // Add category for consistent styling
    }
    return placesData.find(p => p.id === id);
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
      }}
    >
      {/* Map container */}
      <MapContainer
        center={[41.015, 28.9795]}
        zoom={12}
        style={{ height: "100%", width: "100%", zIndex: 1 }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a>'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />

        {placesData.map((p, idx) => {
          const isInActiveDay = activeDay
            ? activeDay.plan.some(item => getPlaceDetails(item.placeId)?.id === p.id)
            : false;

          const markerOpacity = activeDay && !isInActiveDay ? 0.3 : 0.9;
          const markerRadius = activeDay && isInActiveDay ? 8 : 6; // Highlight by increasing radius
          const markerWeight = activeDay && isInActiveDay ? 2 : 1.2; // Increase border weight

          // Render HOTEL_LOCATION separately if it's not part of placesData
          if (p.id === HOTEL_LOCATION.id) {
              // This is already handled if HOTEL_LOCATION is found in placesData
              // If HOTEL_LOCATION is NOT in placesData, you'd add a separate marker here.
              // For now, assume it might be referenced via ID but also explicitly added below for clarity.
          }


          if (p.icon) {
            return (
              <Marker
                key={p.id || idx}
                position={[p.lat, p.lon]}
                icon={p.icon}
                opacity={markerOpacity}
              >
                <Popup>
                  <b>{p.title}</b>
                  <div dangerouslySetInnerHTML={{ __html: p.html }} />
                </Popup>
              </Marker>
            );
          } else {
            return (
              <CircleMarker
                key={p.id || idx}
                center={[p.lat, p.lon]}
                pathOptions={{
                  color: colors[p.category] || colors.other,
                  fillColor: colors[p.category] || colors.other,
                  fillOpacity: markerOpacity,
                  weight: markerWeight,
                  opacity: markerOpacity,
                }}
                radius={markerRadius}
              >
                <Popup>
                  <b>{p.title}</b>
                  <div dangerouslySetInnerHTML={{ __html: p.html }} />
                </Popup>
              </CircleMarker>
            );
          }
        })}

        {/* Explicitly add hotel marker (if not already included in placesData) */}
        <Marker
            key={HOTEL_LOCATION.id}
            position={HOTEL_LOCATION.coords}
            icon={makeEmojiIcon("🏠")} // Using home icon for hotel
            opacity={activeDay ? 0.9 : 0.9} // Always show hotel
        >
            <Popup>
                <b>{HOTEL_LOCATION.title}</b>
                <div>Your starting point for daily adventures.</div>
            </Popup>
        </Marker>


        {/* Render Routes */}
        {activeDay && dayRoutes.map((route, idx) => (
          <Polyline
            key={route.id || idx}
            positions={route.path}
            pathOptions={{
              color: route.mode === "walk" ? 'darkgreen' : (route.mode === "car" || route.mode === "taxi" ? 'red' : 'blue'),
              weight: 4,
              opacity: 0.7,
              dashArray: route.mode === "metro" || route.mode === "tram" || route.mode === "ferry" ? '5, 10' : null // Dotted line for public transport
            }}
          >
            <Popup>
              <b>Travel Mode: {route.mode.charAt(0).toUpperCase() + route.mode.slice(1)}</b><br/>
              Details: {route.details}<br/>
              Duration: ~{Math.round(route.durationMin)} min
            </Popup>
          </Polyline>
        ))}
      </MapContainer>

      {/* Sidebar (overlays, not pushes) */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: sidebarOpen ? 0 : "-270px",
          width: "270px",
          height: "100%",
          background: "rgba(20,20,20,0.8)",
          backdropFilter: "blur(8px)",
          color: "white",
          padding: "25px 20px",
          transition: "left 0.3s ease-in-out",
          zIndex: 999,
          overflowY: "auto",
          boxShadow: sidebarOpen ? "2px 0 10px rgba(0,0,0,0.3)" : "none",
        }}
      >
        <h2 style={{ fontSize: "18px", marginBottom: "15px" }}>🗺️ Plan des jours</h2>
        <h3 style={{ fontSize: "16px", marginBottom: "10px", color: "#eee" }}>Itinerary</h3>
        {itineraries.map((dayPlan) => (
          <button
            key={dayPlan.day}
            onClick={() => setActiveDay(dayPlan)}
            style={{
              display: "block",
              width: "100%",
              padding: "10px 15px",
              marginBottom: "8px",
              background: activeDay && activeDay.day === dayPlan.day ? "rgba(255,255,255,0.2)" : "rgba(255,255,255,0.1)",
              color: "white",
              border: "none",
              borderRadius: "5px",
              textAlign: "left",
              cursor: "pointer",
              fontSize: "14px",
              fontWeight: activeDay && activeDay.day === dayPlan.day ? "bold" : "normal",
              transition: "background 0.2s ease-in-out",
            }}
            onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,255,255,0.2)"}
            onMouseLeave={(e) => {
              if (!(activeDay && activeDay.day === dayPlan.day)) {
                e.currentTarget.style.background = "rgba(255,255,255,0.1)";
              }
            }}
          >
            Day {dayPlan.day}: {dayPlan.date}
          </button>
        ))}

        <button
          onClick={() => setActiveDay(null)} // Clear active day to show all markers
          style={{
                        display: "block",
            width: "100%",
            padding: "10px 15px",
            marginTop: "15px",
            background: "rgba(255,0,0,0.2)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(255,0,0,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(255,0,0,0.2)"}
        >
          Show All Markers
        </button>

        <button
          onClick={() => setShowLegend(!showLegend)}
          style={{
            display: "block",
            width: "100%",
            padding: "10px 15px",
            marginTop: "10px",
            background: "rgba(0,0,0,0.2)",
            color: "white",
            border: "none",
            borderRadius: "5px",
            textAlign: "center",
            cursor: "pointer",
            fontSize: "14px",
            fontWeight: "bold",
            transition: "background 0.2s ease-in-out",
          }}
          onMouseEnter={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.3)"}
          onMouseLeave={(e) => e.currentTarget.style.background = "rgba(0,0,0,0.2)"}
        >
          {showLegend ? "Hide Legend" : "Show Legend"}
        </button>

        {showLegend && (
          <div style={{ marginTop: "15px", fontSize: "13px", lineHeight: "1.5" }}>
            <h4 style={{ marginBottom: "5px" }}>Legend</h4>
            <div>🟢 Museums</div>
            <div>🔵 Shops</div>
            <div>🟠 Food</div>
            <div>🟣 Bazaars</div>
            <div>🔴 Malls</div>
            <div>🟤 Other / Hotel</div>
          </div>
        )}
      </div>

      {/* Sidebar toggle button */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        style={{
          position: "absolute",
          top: "20px",
          left: sidebarOpen ? "280px" : "10px",
          zIndex: 1000,
          background: "rgba(0,0,0,0.6)",
          color: "white",
          border: "none",
          padding: "8px 12px",
          borderRadius: "5px",
          cursor: "pointer",
          transition: "left 0.3s ease-in-out",
        }}
      >
        {sidebarOpen ? "← " : "☰ "}
      </button>

    {activeDay && (
  <DayPlanSidebar
    dayPlan={activeDay}
    onClose={() => setActiveDay(null)}
    getPlaceDetails={getPlaceDetails}
  />
)}
    </div>
  );
}
