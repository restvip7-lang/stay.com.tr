/// <reference types="astro/client" />
declare namespace App {
  interface Locals {
    /** Язык страницы — из префикса URL (/ru/, /en/…). */
    lang: import('./i18n/config').Lang;
  }
}
