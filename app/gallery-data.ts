export type GalleryPhoto = {
  id: string;
  src: string;
  alt: string;
  title: string;
  credit: string;
  sourceUrl: string;
  licenseUrl?: string;
  changes?: string;
};

// Captions describe the pictured area only; these photos are not 3D survey data.
export const galleryPhotos: Record<string, GalleryPhoto[]> = {
  "shanti-stupa": [
    {
      id: "shanti-stupa-relief",
      src: "/heritage/gallery/shanti-stupa-relief.jpg",
      title: "Buddha relief on the stupa",
      alt: "Gold-coloured Buddha relief surrounded by white ornament at Shanti Stupa in Leh",
      credit: "(c) Yann Forget / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Gold_plated_Buddha,_Shanti_Stupa,_Leh,_Ladakh.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
    {
      id: "shanti-stupa-interior",
      src: "/heritage/gallery/shanti-stupa-interior.jpg",
      title: "Inside the temple",
      alt: "Buddha statue and altar inside the temple at Shanti Stupa, Leh",
      credit: "(c) Yann Forget / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Buddha_statue_in_the_temple_of_Shanti_Stupa,_Leh,_Ladakh.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
  ],
  konark: [
    {
      id: "konark-wheel",
      src: "/heritage/gallery/konark-wheel.jpg",
      title: "Carved chariot wheel",
      alt: "Carved stone wheel and surrounding relief work on Konark Sun Temple",
      credit: "Ankur Panchbudhe / Wikimedia Commons / CC BY 2.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Konark_Sun_Temple_wheel.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by/2.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
    {
      id: "konark-surya",
      src: "/heritage/gallery/konark-surya.jpg",
      title: "Surya wall sculpture",
      alt: "Sculpture of the sun god Surya in a stone niche on Konark Sun Temple",
      credit: "Pratishkhedekar / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Surya,_Konark_01.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
  ],
  nalanda: [
    {
      id: "nalanda-temple-stairs",
      src: "/heritage/gallery/nalanda-temple-stairs.jpg",
      title: "Temple 3 stairway",
      alt: "Brick stairway leading up Temple 3 at the ancient Nalanda archaeological site",
      credit: "G41rn8 / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Nalanda_Temple_3_ei7-09.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
    {
      id: "nalanda-monastery-courtyard",
      src: "/heritage/gallery/nalanda-monastery-courtyard.jpg",
      title: "Monastery 7 courtyard",
      alt: "Excavated brick courtyard and surviving rooms of Monastery 7 at Nalanda",
      credit: "Uphogaphy / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Monastery_7,_Nalanda.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Wikimedia resized preview; no content alterations.",
    },
  ],
  khajuraho: [
    {
      id: "kandariya-entrance",
      src: "/heritage/gallery/kandariya-entrance.jpg",
      title: "Entrance porch",
      alt: "Carved entrance porch of Kandariya Mahadev Temple at Khajuraho",
      credit: "Itsmalay~commonswiki / Wikimedia Commons / CC BY-SA 4.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:Kandariya_Mahadev_Temple_Entrance_Porch.jpg",
      licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
      changes: "Original image; no content alterations.",
    },
    {
      id: "kandariya-detail",
      src: "/heritage/gallery/kandariya-detail.jpg",
      title: "Temple architectural detail",
      alt: "Close view of carved stone architecture at Kandariya Mahadev Temple",
      credit: "Ms Sarah Welch / Wikimedia Commons / CC0 1.0",
      sourceUrl: "https://commons.wikimedia.org/wiki/File:0121821_Kandariya_Mahadev_temple,_Khajuraho_Madhya_Pradesh_04.jpg",
      licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
      changes: "Original image; no content alterations.",
    },
  ],
};
