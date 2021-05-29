import { extendTheme } from "@chakra-ui/react";

const theme = extendTheme({
    styles: {
        global: (props) => ({
          "html, body": {
            background: props.colorMode === "dark" ? "#100f13" : "white",
          },
        }),
      },
    fonts: {
      heading: "GT Walsheim, Segoe UI",
      body: "GT Walsheim, Segoe UI",
    },
    fontWeights: {
      normal: 400,
      medium: 600,
      bold: 900
    },
    config: {
      cssVarPrefix: "c",
      initialColorMode: "dark"
    }
})

export default theme;
