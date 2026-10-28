// Общие данные сайта: контакты, ссылки брендов, соцсети.
export const site = {
  name: 'Stay Property',
  phone: { label: '+90 530 178 29 16', href: 'tel:+905301782916' },
  phones: [
    { country: 'Турция', label: '+90-530-178-29-16', href: 'https://wa.me/905301782916' },
    { country: 'Россия', label: '+7-499-350-8099', href: 'tel:+74993508099' },
  ],
  email: 'office@stayproperty.com',
  address: 'Oba Mah., Mesut Cd., No: 54/A – 07400 Alanya / Antalya / Turkey',
  brands: [
    { label: 'STAY PROJECTS', href: '/complex/' },
    { label: 'STAY PROPERTY', href: '/sale/' },
    { label: 'PRIVE', href: '/prive/' },
    { label: 'RENTAL', href: '/rental/' },
    { label: 'INVESTMENT', href: 'https://stayinvestment.com/', external: true },
  ],
  socials: [
    { name: 'instagram', href: 'https://www.instagram.com/stayproperty/' },
    { name: 'youtube', href: 'https://www.youtube.com/@stayproperty' },
    { name: 'facebook', href: 'https://www.facebook.com/stayproperty.ru/' },
    { name: 'telegram', href: 'https://t.me/stayproperty' },
    { name: 'vk', href: 'https://vk.com/stay_property' },
  ],
  streamUrl: 'https://www.youtube.com/@StayProperty/streams',
};

export const noindex = (import.meta.env.STAY_NOINDEX ?? '1') !== '0';
