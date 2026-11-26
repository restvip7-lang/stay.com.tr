/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    /** Язык страницы — из префикса URL (/ru/, /en/…). */
    lang: import('./i18n/config').Lang;
    /** Раздел для подсветки шапки, если по адресу его не понять: страница нашего проекта/квартиры — 'own', PRIVE-ЖК — 'prive'. */
    navSection?: 'own' | 'prive';
  }
}
