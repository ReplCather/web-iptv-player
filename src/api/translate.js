import axios from "axios";

const MYMEMORY_API = "https://api.mymemory.translated.net/get";

export async function translate(input, from = "auto", to = "en") {
  try {
    const response = await axios.get(MYMEMORY_API, {
      params: {
        q: input,
        langpair: `${from}|${to}`
      }
    });
    if (response.data.responseStatus === 200) {
      return response.data.responseData.translatedText;
    }
    return input;
  } catch (error) {
    console.error("Translation error:", error);
    return input;
  }
}
