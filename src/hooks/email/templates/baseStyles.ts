
/**
 * Base email styles that can be shared across templates
 */

export const baseStyles = {
  darkTheme: `
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #0a0a0a;
      color: #ffffff;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #0a0a0a;
    }
    .header {
      text-align: center;
      padding: 20px 0;
      border-bottom: 1px solid #333;
    }
    .logo {
      font-size: 28px;
      font-weight: bold;
    }
    .blue-text {
      color: #00E5FF;
    }
    .content {
      padding: 30px 0;
    }
    .button {
      display: inline-block;
      background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
      color: #000000;
      text-decoration: none;
      padding: 12px 30px;
      border-radius: 50px;
      font-weight: bold;
      margin: 20px 0;
      text-align: center;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      font-size: 12px;
      color: #888;
      border-top: 1px solid #333;
    }
  `,
  
  lightTheme: `
    body {
      font-family: Arial, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f4f4f4;
      color: #333;
    }
    .container {
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
      background-color: #ffffff;
    }
    .header {
      background: linear-gradient(90deg, #00E5FF 0%, #0077FF 100%);
      padding: 20px;
      text-align: center;
      color: #000;
    }
    .content {
      padding: 30px 20px;
    }
    .button {
      display: inline-block;
      background: #00E5FF;
      color: #000;
      padding: 12px 25px;
      text-decoration: none;
      border-radius: 4px;
      font-weight: bold;
      margin: 20px 0;
    }
    .footer {
      text-align: center;
      padding-top: 30px;
      font-size: 12px;
      color: #999;
      border-top: 1px solid #eee;
    }
  `
};
