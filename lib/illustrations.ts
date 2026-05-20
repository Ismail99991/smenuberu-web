// lib/illustrations.ts
export const getIllustrationUrl = (type: string): string => {
  const BASE_URL = 'https://s3.regru.cloud/smenuberu/icons';
  
  const icons: Record<string, string> = {
    'driver': 'driver.png',           // водитель ✅
    'picker': 'warepicker.png',       // комплектовщик ✅
    'loader': 'unprofile.png',        // грузчик → универсальная иконка
    'cook': 'baker.png',              // повар → пекарь (похожие профессии)
    'waiter': 'unprofile.png',        // официант → универсальная
    'cleaner': 'unprofile.png',       // уборщик → универсальная
    'other': 'unprofile.png',         // другое → универсальная
  };
  
  const iconName = icons[type] || 'unprofile.png';
  return `${BASE_URL}/${iconName}`;
};