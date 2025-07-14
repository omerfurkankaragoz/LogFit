// src/services/exerciseApi.ts

const API_KEY = import.meta.env.VITE_RAPIDAPI_KEY;
const BASE_URL = 'https://exercisedb.p.rapidapi.com';

export interface Exercise {
  id: string;
  name: string;
  bodyPart: string;
  equipment: string;
  gifUrl: string;
  target: string;
  instructions: string[];
}

// API'den gelen veriyi güvenli bir şekilde işleyen yardımcı fonksiyon
const processApiResponse = (data: any[]): Exercise[] => {
  if (!Array.isArray(data)) {
    // API'den beklenen format gelmezse boş dizi döndür.
    return [];
  }
  return data.map(ex => ({
    ...ex,
    // Eğer ex.gifUrl varsa .replace() yap, yoksa boş string ata.
    gifUrl: ex.gifUrl ? ex.gifUrl.replace('http://', 'https://') : ''
  }));
};

/**
 * API üzerinden, verilen isme göre arama yapar.
 */
export const searchExercisesByName = async (name: string): Promise<Exercise[]> => {
  if (!name.trim() || !API_KEY) {
      return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/exercises/name/${name}?limit=200`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });

    if (!response.ok) {
      return [];
    }

    const data = await response.json();
    return processApiResponse(data);

  } catch (error) {
    return [];
  }
};

/**
 * API üzerinden, verilen vücut bölgesine göre egzersizleri listeler.
 */
export const getExercisesByBodyPart = async (bodyPart: string): Promise<Exercise[]> => {
  if (bodyPart === 'all' || !bodyPart || !API_KEY) {
      return [];
  }

  try {
    const response = await fetch(`${BASE_URL}/exercises/bodyPart/${bodyPart.toLowerCase()}?limit=200`, {
      headers: {
        'X-RapidAPI-Key': API_KEY,
        'X-RapidAPI-Host': 'exercisedb.p.rapidapi.com'
      }
    });
    if (!response.ok) {
        return [];
    }
    
    const data = await response.json();
    return processApiResponse(data);

  } catch (error) {
    return [];
  }
};

/**
 * Mevcut tüm vücut bölgesi kategorilerini döndürür.
 */
export const getBodyParts = (): string[] => {
    return ['back', 'cardio', 'chest', 'lower arms', 'lower legs', 'neck', 'shoulders', 'upper arms', 'upper legs', 'waist'];
};