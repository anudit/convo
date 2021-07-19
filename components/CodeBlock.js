import React from "react"
import { chakra, Code, useColorMode } from "@chakra-ui/react"

export const MakeOwnCodeBlock = (props) => {

  const { colorMode } = useColorMode();
  return (
    <Code backgroundColor={colorMode === "dark" ? "#2b213a" : "#f5f5f5"} px={4} py={2} borderRadius="5px" fontSize="md">
      <chakra.span color="#6599FF">&lt;iframe</chakra.span>
      <chakra.span color="#f92aad">&nbsp;src</chakra.span><chakra.span color="cyan">=</chakra.span><chakra.span color="#ff8b39">{props?.value}</chakra.span>
      <chakra.span color="#f92aad">&nbsp;allowtransparency</chakra.span><chakra.span color="cyan">=</chakra.span><chakra.span color="#ff8b39">&quot;true&quot;</chakra.span>
      <chakra.span color="#f92aad">&nbsp;loading</chakra.span><chakra.span color="cyan">=</chakra.span><chakra.span color="#ff8b39">&quot;eager&quot;</chakra.span>
      <chakra.span color="#6599FF">/&gt;</chakra.span>
    </Code>
  )

}
