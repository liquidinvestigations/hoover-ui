module.exports = {
  "env": {
    "development": {
      "presets": [
        "next/babel"
      ],
      "plugins": ["@babel/plugin-proposal-private-methods"]
    },
    "production": {
      "presets": [
        "next/babel"
      ],
      "plugins": ["@babel/plugin-proposal-private-methods"]
    },
    "test": {
      "presets": [
        [
          "next/babel",
          {
            "preset-env": {
              "modules": "commonjs"
            }
          }
        ]
      ]
    }
  }
}