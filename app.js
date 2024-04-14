;(async () => {
  const fastify = require("fastify")()

  const cors = require("@fastify/cors")

  await fastify.register(cors, {
    // put your options here
    origin: false,
  })

  const { createSigner, createDecoder } = require("fast-jwt")

  const axios = require("axios")

  await fastify.register(require("@fastify/swagger"), {
    mode: "dynamic",
    openapi: {
      info: {
        title: "2C2P Server to Server POC",
        description:
          "POC built for user payment with Non-3DS card. <br />Default merchant is Thailand merchantID: JT04 for testing purpose. <br /> Use following card for testing <br />Visa: 4111111111111111 <br />MasterCard: 5555555555554444 <br />Amex: 374340095639074 <br />Use random Expiry Month, Expiry Year and CVV for testing",
        version: "0.1.0",
      },
      servers: [
        {
          url: "/",
        },
      ],
      tags: ["payment"],
      //   components: {
      //     securitySchemes: {
      //       apiKey: {
      //         type: "apiKey",
      //         name: "apiKey",
      //         in: "header",
      //       },
      //     },
      //   },
    },
  })

  await fastify.register(require("@fastify/swagger-ui"), {
    routePrefix: "/",
    uiConfig: {
      docExpansion: "list",
      deepLinking: false,
    },
    uiHooks: {
      onRequest: function (request, reply, next) {
        next()
      },
      preHandler: function (request, reply, next) {
        next()
      },
    },
    staticCSP: true,
    transformStaticCSP: (header) => header,
  })

  fastify.post(
    "/payment",
    {
      schema: {
        description: "Fill the user information to pay",
        tags: ["payment"],
        summary: "Server to server direct payment",
        body: {
          type: "object",
          properties: {
            invoiceNo: {
              type: "string",
              description: "invoice No.",
            },
            amount: {
              type: "number",
              description: "amount",
            },
            name: {
              type: "string",
              description: "user name",
            },
            email: {
              type: "string",
              description: "user email",
            },
            cardNo: {
              type: "string",
              description: "card No.",
            },
            expiryMonth: {
              type: "string",
              description: "expiry month",
            },
            expiryYear: {
              type: "string",
              description: "expiry year",
            },
            securityCode: {
              type: "string",
              description: "CVV code",
            },
          },
        },
        response: {
          201: {
            description: "Successful response",
            type: "object",
            properties: {
              msg: { type: "string" },
            },
          },
          default: {
            description: "Default response",
            type: "object",
            properties: {
              channelCode: { type: "string" },
              invoiceNo: { type: "string" },
              respCode: { type: "string" },
              respDesc: { type: "string" },
            },
          },
        },
      },
    },
    async (req, res) => {
      console.log(req)

      const signSync = createSigner({
        key: "CD229682D3297390B9F66FF4020B758F4A5E625AF4992E5D75D311D6458B38E2",
      })
      const decode = createDecoder()

      const token = signSync({
        merchantID: "JT04",
        invoiceNo: req.body.invoiceNo,
        description: "Test item 000",
        amount: req.body.amount,
        currencyCode: "THB",
        paymentChannel: ["CC"],
        request3DS: "N",
      })

      console.log(`payload token: ${token}`)

      let resp = await axios.post(
        "https://sandbox-pgw.2c2p.com/payment/4.3/paymentToken",
        { payload: token }
      )

      console.log("paymentToken response: ", resp.data.payload)

      const decodePayload = decode(resp.data.payload)

      console.log(`Decoded payload token: ${decodePayload.paymentToken}`)

      resp = await axios.post(
        "https://sandbox-pgw.2c2p.com/payment/4.3/payment",
        {
          payment: {
            data: {
              name: req.body.name,
              email: req.body.email,
              securityCode: req.body.securityCode,
              cardNo: req.body.cardNo,
              expiryMonth: req.body.expiryMonth,
              expiryYear: req.body.expiryYear,
            },
            code: {
              channelCode: "CC",
            },
          },
          paymentToken: decodePayload.paymentToken,
        }
      )

      console.log("payment response: ", resp)

      res.send(resp.data)
    }
  )

  fastify.post(
    "/paymentInquiry",
    {
      schema: {
        description: "Fill the invoice ID to inquiry",
        tags: ["payment"],
        summary: "Server to server payment inquiry",
        body: {
          type: "object",
          properties: {
            invoiceNo: {
              type: "string",
              description: "invoice No.",
            },
          },
        },
        response: {
          201: {
            description: "Successful response",
            type: "object",
            properties: {
              msg: { type: "string" },
            },
          },
          default: {
            description: "Default response",
            type: "object",
            properties: {
              accountNo: { type: "string" },
              agentCode: { type: "string" },
              amount: { type: "number" },
              approvalCode: { type: "string" },
              cardType: { type: "string" },
              channelCode: { type: "string" },
              childMerchantID: { type: "string" },
              currencyCode: { type: "string" },
              customerToken: { type: "string" },
              customerTokenExpiry: { type: "string" },
              paymentID: { type: "string" },
              paymentScheme: { type: "string" },
              processBy: { type: "string" },
              recurringUniqueID: { type: "string" },
              referenceNo: { type: "string" },
              respCode: { type: "string" },
              respDesc: { type: "string" },
              schemePaymentID: { type: "string" },
              tranRef: { type: "string" },
              transactionDateTime: { type: "string" },
              uniqueAccountReference: { type: "string" },
              userDefined1: { type: "string" },
              userDefined2: { type: "string" },
              userDefined3: { type: "string" },
              userDefined4: { type: "string" },
              userDefined5: { type: "string" },
            },
          },
        },
      },
    },
    async (req, res) => {
      const signSync = createSigner({
        key: "CD229682D3297390B9F66FF4020B758F4A5E625AF4992E5D75D311D6458B38E2",
      })

      const decode = createDecoder()

      const token = signSync({
        merchantID: "JT04",
        invoiceNo: req.body.invoiceNo,
      })

      console.log(`inquiry token: ${token}`)

      let resp = await axios.post(
        "https://sandbox-pgw.2c2p.com/payment/4.3/paymentinquiry",
        { payload: token }
      )

      const detail = decode(resp.data.payload)

      console.log(detail)

      res.send(detail)
    }
  )

  await fastify.ready()
  fastify.swagger()

  await fastify.listen({ port: "3000", host: "0.0.0.0" }, (err) => {
    if (err) throw err
    console.log("Server started.")
  })
})().catch((e) => {
  console.log(e)
})
