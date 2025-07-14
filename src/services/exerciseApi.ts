// API anahtarını Vercel'e eklediğimiz ortam değişkeninden güvenli bir şekilde alıyoruz.
const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

// Hareket verisi için arayüz tanımı
export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  instructions: string[];
}

/**
 * API'den veya API anahtarı yoksa demo verilerden tüm egzersizleri çeker.
 */
export const getExercises = async (): Promise<Exercise[]> => {
  // Eğer API anahtarı Vercel'de tanımlı değilse veya yerel geliştirmede bulunmuyorsa,
  // demo verileri kullanarak uygulamanın çalışmaya devam etmesini sağla.
  if (!API_KEY) {
    console.warn("RapidAPI anahtarı bulunamadı. Yerel demo verileri kullanılıyor.");
    return DEMO_EXERCISES;
  }

  try {
    const response = await fetch(`${BASE_URL}/exercises?limit=1500`, { // Limiti artırarak daha fazla veri çekiyoruz
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
        console.error("API isteği başarısız oldu:", response.status, response.statusText);
        // API hatası durumunda yine de demo verileri döndürerek uygulamanın çökmesini engelle.
        return DEMO_EXERCISES;
    }

    const data = await response.json();
    return data;

  } catch (error) {
    console.error("API'den veri çekilirken bir hata oluştu:", error);
    // Herhangi bir ağ hatasında da demo verileri güvenli bir yedek olarak kullanılır.
    return DEMO_EXERCISES;
  }
};

/**
 * Belirli bir vücut bölgesine göre egzersizleri filtreler.
 * @param bodyPart Filtrelenecek vücut bölgesi (örn: 'chest', 'back').
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
    const exercises = await getExercises();
    return exercises.filter(ex => ex.bodyPart.toLowerCase() === bodyPart.toLowerCase());
};

/**
 * Hareket adı veya hedef kas grubuna göre arama yapar.
 * @param query Aranacak metin.
 */
export const searchExercises = async (query: string): Promise<Exercise[]> => {
    const exercises = await getExercises();
    const lowercasedQuery = query.toLowerCase();
    return exercises.filter(ex => 
      ex.name.toLowerCase().includes(lowercasedQuery) ||
      ex.target.toLowerCase().includes(lowercasedQuery) ||
      ex.equipment.toLowerCase().includes(lowercasedQuery)
    );
};

/**
 * Mevcut tüm vücut bölgesi kategorilerini döndürür.
 */
export const getBodyParts = (): string[] => {
    // API'nin döndürdüğü kategorilere göre güncellenmiş liste
    return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
};


// API anahtarı bulunamadığında veya bir hata oluştuğunda kullanılacak yedek (demo) veriler.
// Bu liste, uygulamanın her koşulda çalışmasını sağlar.
const DEMO_EXERCISES: Exercise[] = [
  { id: '1', name: 'Barbell Bench Press', bodyPart: 'chest', equipment: 'barbell', gifUrl: '', target: 'pectorals', instructions: [] },
  { id: '2', name: 'Dumbbell Bench Press', bodyPart: 'chest', equipment: 'dumbbell', gifUrl: '', target: 'pectorals', instructions: [] },
  { id: '12', name: 'Barbell Row', bodyPart: 'back', equipment: 'barbell', gifUrl: '', target: 'lats', instructions: [] },
  { id: '17', name: 'Seated Cable Row - V Grip', bodyPart: 'back', equipment: 'cable', gifUrl: '', target: 'middle back', instructions: [] },
  { id: '21', name: 'Barbell Squat', bodyPart: 'upper legs', equipment: 'barbell', gifUrl: '', target: 'quadriceps', instructions: [] },
  { id: '22', name: 'Leg Press', bodyPart: 'upper legs', equipment: 'machine', gifUrl: '', target: 'quadriceps', instructions: [] },
  { id: '31', name: 'Overhead Press (Barbell)', bodyPart: 'shoulders', equipment: 'barbell', gifUrl: '', target: 'deltoids', instructions: [] },
  { id: '41', name: 'Barbell Curl', bodyPart: 'upper arms', equipment: 'barbell', gifUrl: '', target: 'biceps', instructions: [] },
  { id: '102', name: 'EZ-Bar Bicep Curl (Z-Bar)', bodyPart: 'upper arms', equipment: 'ez-bar', gifUrl: '', target: 'biceps', instructions: [] },
  { id: '108', name: 'Tricep Rope Pushdown', bodyPart: 'upper arms', equipment: 'cable', gifUrl: '', target: 'triceps', instructions: [] },
];