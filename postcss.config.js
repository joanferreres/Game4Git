export default {
  plugins: {
    tailwindcss: {},
    // Autoprefixer desactivado temporalmente debido a problemas de compatibilidad
    // ...(process.env.NODE_ENV === 'production' ? { autoprefixer: {} } : {})
  }
}
