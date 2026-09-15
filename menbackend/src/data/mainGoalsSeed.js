const MAIN_GOAL_CONFIG = {
  id: 'default',
  screenTitle: 'Үндсэн зорилгоо сонгоно уу',
  defaultKey: 'erectile_function',
};

const MAIN_GOAL_OPTIONS = [
  {
    key: 'erectile_function',
    title: 'Эрекцийг сайжруулах',
    description:
      'Илүү бат бөх, удаан эрекц — оронд итгэлтэй, илүү сайхан мэдэр',
    sortOrder: 0,
    active: true,
  },
  {
    key: 'ejaculation_control',
    title: 'Ургацын хяналтыг сайжруулах',
    description: 'Ургацаа хянах, илүү удаан бай, хэт эрт дуусахаас сэргийл',
    sortOrder: 1,
    active: true,
  },
  {
    key: 'sexual_wellness',
    title: 'Бэлгийн эрүүл мэндийг дээд түвшинд хүргэх',
    description: 'Эрекц, ургацын хяналт, тэсвэрийг хамтад нь сайжруул',
    sortOrder: 2,
    active: true,
  },
];

module.exports = { MAIN_GOAL_CONFIG, MAIN_GOAL_OPTIONS };
