module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Light color scheme
        lightBgPrimary: "#C0E1D2",
        lightBgSecondary: "#F3F3E0",
        lightBgAccent: "#FBE8CE",

        lightBtnPrimary: "#3E5879",

        lightTextPrimary: "#124170",
        lightTextSecondary: "#093C5D",
        lightTextAccent: "#EBF4F6",

        lightTextError: "#C30E59",
      },
      fontFamily: {
        robotoMono: ["ROBOTO_MONO"],
      },
    },
  },
  plugins: [],
};
