module.exports = test => {
  test(
    `
    import (
      "https://github.com/ConsenSys/avalanche/blob/main/pkg/logging/logging.go",
      "https://github.com/ConsenSys/avalanche/blob/main/pkg/client2/types.go"
    )
    `,
    {
      type: 'Program',
      body: [
        {
          type: 'ImportStatement',
          imports: [
            {
              type: 'StringLiteral',
              value: 'https://github.com/ConsenSys/avalanche/blob/main/pkg/logging/logging.go'
            },
            {
              type: 'StringLiteral',
              value: 'https://github.com/ConsenSys/avalanche/blob/main/pkg/client2/types.go'
            },
          ]
        },
      ]
    }
  )

}
