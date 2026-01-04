import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import * as puppeteer from 'puppeteer';

@Injectable()
export class ImageGeneratorService {
  private readonly logger = new Logger(ImageGeneratorService.name);
  private readonly uploadPath: string;

  constructor(private configService: ConfigService) {
    this.uploadPath = path.join(process.cwd(), 'uploads', 'notifications');
    this.ensureDirectoryExists();
  }

  private ensureDirectoryExists() {
    if (!fs.existsSync(this.uploadPath)) {
      fs.mkdirSync(this.uploadPath, { recursive: true });
    }
  }

  async generateNotificationImage(
    billNumber: string,
    amount: number,
    commission: number,
    customerName?: string,
    serviceType?: string,
  ): Promise<string> {
    try {
      const logoUrl = this.configService.get<string>('LOGO_URL', '');
      const template = this.getNotificationTemplate(amount, commission, customerName, serviceType, logoUrl);
      
      const filename = `bill_${billNumber}_${crypto.randomBytes(8).toString('hex')}.png`;
      const filepath = path.join(this.uploadPath, filename);
      
      // Use puppeteer for reliable HTML to image conversion
      await this.generateWithPuppeteer(template, filepath);

      // Return public URL
      const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
      return `${baseUrl}/uploads/notifications/${filename}`;
      
    } catch (error) {
      this.logger.error('Failed to generate image:', error);
      return this.createFallbackUrl(billNumber, amount, commission);
    }
  }

  private async generateWithPuppeteer(html: string, outputPath: string): Promise<void> {
    let browser = null;
    
    try {
      // Launch browser with optimized settings for server environment
      browser = await puppeteer.launch({
        headless: 'new',
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
          '--disable-web-security',
          '--disable-features=VizDisplayCompositor',
          '--single-process'
        ],
        defaultViewport: {
          width: 1024,
          height: 512,
        }
      });

      const page = await browser.newPage();
      
      // Set HTML content
      await page.setContent(html, {
        waitUntil: 'networkidle0',
        timeout: 30000
      });

      // Wait for fonts and images to load
      await page.evaluateHandle('document.fonts.ready');
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Take screenshot
      await page.screenshot({
        path: outputPath,
        type: 'png',
        fullPage: false,
        omitBackground: false,
        captureBeyondViewport: false
      });

      this.logger.log(`Image generated successfully: ${outputPath}`);

    } catch (error) {
      this.logger.error('Puppeteer error:', error);
      throw error;
    } finally {
      if (browser) {
        await browser.close();
      }
    }
  }


  private getNotificationTemplate(
    amount: number,
    commission: number,
    customerName?: string,
    serviceType?: string,
    logoUrl?: string,
  ): string {
    return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Poppins', 'Noto Sans Tamil', sans-serif;
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            width: 1024px;
            height: 512px;
            display: flex;
            justify-content: center;
            align-items: center;
            overflow: hidden;
            position: relative;
        }
        
        /* Background pattern */
        .background-pattern {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            opacity: 0.05;
            background-image: 
                radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
                radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px);
            background-size: 60px 60px;
        }
        
        .notification-container {
            width: 100%;
            height: 100%;
            display: flex;
            border-radius: 20px;
            overflow: hidden;
            box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
            position: relative;
        }
        
        /* Left Side - Gradient with Logo */
        .left-side {
            flex: 1;
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            padding: 40px;
            position: relative;
            overflow: hidden;
        }
        
        .left-side::before {
            content: '';
            position: absolute;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
            background-size: 30px 30px;
            animation: float 20s linear infinite;
        }
        
        @keyframes float {
            0% { transform: translate(0, 0) rotate(0deg); }
            100% { transform: translate(-30px, -30px) rotate(360deg); }
        }
        
        .logo-container {
            width: 120px;
            height: 120px;
            background: rgba(255, 255, 255, 0.15);
            backdrop-filter: blur(10px);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin-bottom: 30px;
            border: 3px solid rgba(255, 255, 255, 0.3);
            box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 2;
        }
        
        .logo-img {
            max-width: 80px;
            max-height: 80px;
            border-radius: 50%;
        }
        
        .tamil-title {
            font-family: 'Noto Sans Tamil', sans-serif;
            font-size: 32px;
            font-weight: 800;
            color: white;
            text-align: center;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
            position: relative;
            z-index: 2;
        }
        
        .english-title {
            font-size: 18px;
            font-weight: 500;
            color: rgba(255, 255, 255, 0.9);
            text-align: center;
            letter-spacing: 2px;
            text-transform: uppercase;
            position: relative;
            z-index: 2;
        }
        
        /* Right Side - Content */
        .right-side {
            flex: 2;
            background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
            padding: 50px;
            display: flex;
            flex-direction: column;
            justify-content: space-between;
            position: relative;
        }
        
        .right-side::before {
            content: '';
            position: absolute;
            top: 0;
            right: 0;
            width: 100%;
            height: 100%;
            background: linear-gradient(45deg, transparent 70%, rgba(99, 102, 241, 0.1) 100%);
            pointer-events: none;
        }
        
        .content-header {
            margin-bottom: 30px;
        }
        
        .greeting {
            font-size: 28px;
            font-weight: 700;
            color: #f1f5f9;
            margin-bottom: 10px;
        }
        
        .greeting span {
            color: #60a5fa;
        }
        
        .message {
            font-size: 18px;
            color: #94a3b8;
            line-height: 1.6;
        }
        
        /* Amount Cards */
        .amounts-container {
            display: flex;
            gap: 30px;
            margin-bottom: 30px;
        }
        
        .amount-card {
            flex: 1;
            background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
            border-radius: 15px;
            padding: 25px;
            border: 1px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
            backdrop-filter: blur(10px);
            transition: transform 0.3s ease;
        }
        
        .amount-card:hover {
            transform: translateY(-5px);
        }
        
        .amount-card.total {
            border-top: 4px solid #10b981;
        }
        
        .amount-card.commission {
            border-top: 4px solid #f59e0b;
        }
        
        .card-label {
            font-size: 16px;
            color: #94a3b8;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .card-label i {
            font-size: 20px;
        }
        
        .card-value {
            font-size: 36px;
            font-weight: 800;
            color: #f8fafc;
        }
        
        .card-value.total {
            color: #10b981;
        }
        
        .card-value.commission {
            color: #f59e0b;
        }
        
        /* Commission Highlight */
        .commission-highlight {
            background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
            border-radius: 15px;
            padding: 20px;
            border: 1px solid rgba(245, 158, 11, 0.2);
            margin-bottom: 20px;
        }
        
        .commission-tamil {
            font-family: 'Noto Sans Tamil', sans-serif;
            font-size: 24px;
            font-weight: 700;
            color: #fbbf24;
            text-align: center;
            text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        .commission-english {
            font-size: 16px;
            color: #fde68a;
            text-align: center;
            margin-top: 5px;
            letter-spacing: 1px;
        }
        
        /* Footer */
        .footer {
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding-top: 20px;
            border-top: 1px solid rgba(255, 255, 255, 0.1);
        }
        
        .customer-info {
            font-size: 16px;
            color: #cbd5e1;
        }
        
        .customer-name {
            color: #60a5fa;
            font-weight: 600;
        }
        
        .date-time {
            font-size: 14px;
            color: #94a3b8;
            text-align: right;
        }
        
        .time {
            font-size: 16px;
            color: #f1f5f9;
            font-weight: 600;
        }
        
        /* Icons */
        .icon {
            display: inline-block;
            margin-right: 8px;
            vertical-align: middle;
        }
        
        /* Currency formatting */
        .currency {
            font-size: 28px;
            vertical-align: top;
        }
        
        /* Glow effect */
        .glow {
            animation: glow 2s ease-in-out infinite alternate;
        }
        
        @keyframes glow {
            from {
                text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
            }
            to {
                text-shadow: 0 0 20px rgba(245, 158, 11, 0.8), 0 0 30px rgba(245, 158, 11, 0.6);
            }
        }
    </style>
</head>
<body>
    <div class="background-pattern"></div>
    <div class="notification-container">
        <!-- Left Side with Logo and Title -->
        <div class="left-side">
            <div class="logo-container">
                ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo">` : '<span style="font-size: 50px; color: white;">💰</span>'}
            </div>
            <div class="tamil-title">பில் உருவாக்கப்பட்டது!</div>
            <div class="english-title">New Payment Received</div>
        </div>
        
        <!-- Right Side with Details -->
        <div class="right-side">
            <div class="content-header">
                <h2 class="greeting">🎉 Congratulations! <span>You've earned commission</span></h2>
                <p class="message">A new payment has been successfully processed in your account</p>
            </div>
            
            <div class="amounts-container">
                <div class="amount-card total">
                    <div class="card-label">
                        <span class="icon">💰</span>
                        Total Amount
                    </div>
                    <div class="card-value total">
                        <span class="currency">₹</span>${amount.toLocaleString('en-IN')}
                    </div>
                </div>
                
                <div class="amount-card commission">
                    <div class="card-label">
                        <span class="icon">💸</span>
                        Your Commission
                    </div>
                    <div class="card-value commission glow">
                        <span class="currency">₹</span>${commission.toLocaleString('en-IN')}
                    </div>
                </div>
            </div>
            
            <div class="commission-highlight">
                <div class="commission-tamil">லாபம் பெற்றுள்ளீர்கள்!</div>
                <div class="commission-english">Profit Earned Successfully</div>
            </div>
            
            <div class="footer">
                <div class="customer-info">
                    ${customerName ? `Customer: <span class="customer-name">${customerName}</span>` : 'Payment Received'}
                </div>
                <div class="date-time">
                    <div class="time">${new Date().toLocaleDateString('en-IN', { 
                        day: '2-digit',
                        month: 'short',
                        year: 'numeric'
                    })} ${new Date().toLocaleTimeString('en-IN', { 
                        hour: '2-digit',
                        minute: '2-digit',
                        hour12: true 
                    })}</div>
                    Keep up the great work!
                </div>
            </div>
        </div>
    </div>
    
    <!-- Icons as SVG for better rendering -->
    <svg style="display: none;">
        <symbol id="rupee-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M13.66 7C13.1 5.82 11.9 5 10.5 5H6V3h12v2h-3.25v1.25H18v2h-2.25V11H18v2h-8v2.5h5.5v1.25H10.5V19H6v-2h4.5v-1.25H6V13.5h4.5v-5H7.5V7h6.16z"/>
        </symbol>
        <symbol id="commission-icon" viewBox="0 0 24 24">
            <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z"/>
        </symbol>
    </svg>
</body>
</html>
    `;
  }


    private createFallbackUrl(billNumber: string, amount: number, commission: number): string {
    const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
    return `${baseUrl}/api/placeholder?bill=${billNumber}&amount=${amount}`;
  }

  async cleanupOldImages(maxAgeHours = 24): Promise<void> {
    try {
      const files = fs.readdirSync(this.uploadPath);
      const now = Date.now();
      const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

      for (const file of files) {
        const filepath = path.join(this.uploadPath, file);
        const stats = fs.statSync(filepath);
        
        if (now - stats.mtimeMs > maxAgeMs) {
          fs.unlinkSync(filepath);
          this.logger.log(`Cleaned up old image: ${file}`);
        }
      }
    } catch (error) {
      this.logger.error('Failed to cleanup old images:', error);
    }
  }

}




















// import { Injectable, Logger } from '@nestjs/common';
// import { ConfigService } from '@nestjs/config';
// import nodeHtmlToImage from 'node-html-to-image';
// import * as fs from 'fs';
// import * as path from 'path';
// import * as crypto from 'crypto';

// @Injectable()
// export class ImageGeneratorService {
//   private readonly logger = new Logger(ImageGeneratorService.name);
//   private readonly uploadPath: string;

//   constructor(private configService: ConfigService) {
//     this.uploadPath = path.join(process.cwd(), 'uploads', 'notifications');
//     this.ensureDirectoryExists();
//   }

//   private ensureDirectoryExists() {
//     if (!fs.existsSync(this.uploadPath)) {
//       fs.mkdirSync(this.uploadPath, { recursive: true });
//     }
//   }

//   async generateNotificationImage(
//   billNumber: string,
//   amount: number,
//   commission: number,
//   customerName?: string,
//   serviceType?: string,
// ): Promise<string> {
//   try {
//     const logoUrl = this.configService.get<string>('LOGO_URL', '');
//     this.logger.log(`Logo URL: ${logoUrl}`);
    
//     const template = this.getNotificationTemplate(amount, commission, customerName, serviceType, logoUrl);
    
//     const filename = `bill_${billNumber}_${crypto.randomBytes(8).toString('hex')}.png`;
//     const filepath = path.join(this.uploadPath, filename);
    
//     this.logger.log(`Generating image at: ${filepath}`);
    
//     await nodeHtmlToImage({
//       output: filepath,
//       html: template,
//       quality: 100,
//       type: 'png',
//       transparent: false,
//       content: { amount, commission, customerName, serviceType },
//       puppeteerArgs: {
//         args: ['--no-sandbox', '--disable-setuid-sandbox'],
//         defaultViewport: {
//           width: 1024,
//           height: 512,
//         },
//       },
//     });

//     // Check if file was created
//     if (fs.existsSync(filepath)) {
//       const stats = fs.statSync(filepath);
//       this.logger.log(`Image created successfully. Size: ${stats.size} bytes`);
//     } else {
//       this.logger.error(`Image file was not created: ${filepath}`);
//     }

//     // Return public URL
//     const baseUrl = this.configService.get<string>('APP_URL', 'http://localhost:3000');
//     const imageUrl = `${baseUrl}/uploads/notifications/${filename}`;
//     this.logger.log(`Image URL: ${imageUrl}`);
    
//     return imageUrl;
//   } catch (error) {
//     this.logger.error('Failed to generate notification image:', error);
//     throw error;
//   }
// }

//   private getNotificationTemplate(
//     amount: number,
//     commission: number,
//     customerName?: string,
//     serviceType?: string,
//     logoUrl?: string,
//   ): string {
//     return `
// <!DOCTYPE html>
// <html>
// <head>
//     <meta charset="UTF-8">
//     <style>
//         @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800&family=Poppins:wght@300;400;500;600;700;800&display=swap');
        
//         * {
//             margin: 0;
//             padding: 0;
//             box-sizing: border-box;
//         }
        
//         body {
//             font-family: 'Poppins', 'Noto Sans Tamil', sans-serif;
//             background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
//             width: 1024px;
//             height: 512px;
//             display: flex;
//             justify-content: center;
//             align-items: center;
//             overflow: hidden;
//             position: relative;
//         }
        
//         /* Background pattern */
//         .background-pattern {
//             position: absolute;
//             top: 0;
//             left: 0;
//             width: 100%;
//             height: 100%;
//             opacity: 0.05;
//             background-image: 
//                 radial-gradient(circle at 25% 25%, #3b82f6 2px, transparent 2px),
//                 radial-gradient(circle at 75% 75%, #8b5cf6 2px, transparent 2px);
//             background-size: 60px 60px;
//         }
        
//         .notification-container {
//             width: 100%;
//             height: 100%;
//             display: flex;
//             border-radius: 20px;
//             overflow: hidden;
//             box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.8);
//             position: relative;
//         }
        
//         /* Left Side - Gradient with Logo */
//         .left-side {
//             flex: 1;
//             background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%);
//             display: flex;
//             flex-direction: column;
//             justify-content: center;
//             align-items: center;
//             padding: 40px;
//             position: relative;
//             overflow: hidden;
//         }
        
//         .left-side::before {
//             content: '';
//             position: absolute;
//             width: 200%;
//             height: 200%;
//             background: radial-gradient(circle, rgba(255,255,255,0.1) 1px, transparent 1px);
//             background-size: 30px 30px;
//             animation: float 20s linear infinite;
//         }
        
//         @keyframes float {
//             0% { transform: translate(0, 0) rotate(0deg); }
//             100% { transform: translate(-30px, -30px) rotate(360deg); }
//         }
        
//         .logo-container {
//             width: 120px;
//             height: 120px;
//             background: rgba(255, 255, 255, 0.15);
//             backdrop-filter: blur(10px);
//             border-radius: 50%;
//             display: flex;
//             align-items: center;
//             justify-content: center;
//             margin-bottom: 30px;
//             border: 3px solid rgba(255, 255, 255, 0.3);
//             box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
//             position: relative;
//             z-index: 2;
//         }
        
//         .logo-img {
//             max-width: 80px;
//             max-height: 80px;
//             border-radius: 50%;
//         }
        
//         .tamil-title {
//             font-family: 'Noto Sans Tamil', sans-serif;
//             font-size: 32px;
//             font-weight: 800;
//             color: white;
//             text-align: center;
//             margin-bottom: 15px;
//             text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
//             position: relative;
//             z-index: 2;
//         }
        
//         .english-title {
//             font-size: 18px;
//             font-weight: 500;
//             color: rgba(255, 255, 255, 0.9);
//             text-align: center;
//             letter-spacing: 2px;
//             text-transform: uppercase;
//             position: relative;
//             z-index: 2;
//         }
        
//         /* Right Side - Content */
//         .right-side {
//             flex: 2;
//             background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
//             padding: 50px;
//             display: flex;
//             flex-direction: column;
//             justify-content: space-between;
//             position: relative;
//         }
        
//         .right-side::before {
//             content: '';
//             position: absolute;
//             top: 0;
//             right: 0;
//             width: 100%;
//             height: 100%;
//             background: linear-gradient(45deg, transparent 70%, rgba(99, 102, 241, 0.1) 100%);
//             pointer-events: none;
//         }
        
//         .content-header {
//             margin-bottom: 30px;
//         }
        
//         .greeting {
//             font-size: 28px;
//             font-weight: 700;
//             color: #f1f5f9;
//             margin-bottom: 10px;
//         }
        
//         .greeting span {
//             color: #60a5fa;
//         }
        
//         .message {
//             font-size: 18px;
//             color: #94a3b8;
//             line-height: 1.6;
//         }
        
//         /* Amount Cards */
//         .amounts-container {
//             display: flex;
//             gap: 30px;
//             margin-bottom: 30px;
//         }
        
//         .amount-card {
//             flex: 1;
//             background: linear-gradient(135deg, rgba(30, 41, 59, 0.8) 0%, rgba(15, 23, 42, 0.8) 100%);
//             border-radius: 15px;
//             padding: 25px;
//             border: 1px solid rgba(255, 255, 255, 0.1);
//             box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
//             backdrop-filter: blur(10px);
//             transition: transform 0.3s ease;
//         }
        
//         .amount-card:hover {
//             transform: translateY(-5px);
//         }
        
//         .amount-card.total {
//             border-top: 4px solid #10b981;
//         }
        
//         .amount-card.commission {
//             border-top: 4px solid #f59e0b;
//         }
        
//         .card-label {
//             font-size: 16px;
//             color: #94a3b8;
//             margin-bottom: 10px;
//             display: flex;
//             align-items: center;
//             gap: 8px;
//         }
        
//         .card-label i {
//             font-size: 20px;
//         }
        
//         .card-value {
//             font-size: 36px;
//             font-weight: 800;
//             color: #f8fafc;
//         }
        
//         .card-value.total {
//             color: #10b981;
//         }
        
//         .card-value.commission {
//             color: #f59e0b;
//         }
        
//         /* Commission Highlight */
//         .commission-highlight {
//             background: linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%);
//             border-radius: 15px;
//             padding: 20px;
//             border: 1px solid rgba(245, 158, 11, 0.2);
//             margin-bottom: 20px;
//         }
        
//         .commission-tamil {
//             font-family: 'Noto Sans Tamil', sans-serif;
//             font-size: 24px;
//             font-weight: 700;
//             color: #fbbf24;
//             text-align: center;
//             text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
//         }
        
//         .commission-english {
//             font-size: 16px;
//             color: #fde68a;
//             text-align: center;
//             margin-top: 5px;
//             letter-spacing: 1px;
//         }
        
//         /* Footer */
//         .footer {
//             display: flex;
//             justify-content: space-between;
//             align-items: center;
//             padding-top: 20px;
//             border-top: 1px solid rgba(255, 255, 255, 0.1);
//         }
        
//         .customer-info {
//             font-size: 16px;
//             color: #cbd5e1;
//         }
        
//         .customer-name {
//             color: #60a5fa;
//             font-weight: 600;
//         }
        
//         .date-time {
//             font-size: 14px;
//             color: #94a3b8;
//             text-align: right;
//         }
        
//         .time {
//             font-size: 16px;
//             color: #f1f5f9;
//             font-weight: 600;
//         }
        
//         /* Icons */
//         .icon {
//             display: inline-block;
//             margin-right: 8px;
//             vertical-align: middle;
//         }
        
//         /* Currency formatting */
//         .currency {
//             font-size: 28px;
//             vertical-align: top;
//         }
        
//         /* Glow effect */
//         .glow {
//             animation: glow 2s ease-in-out infinite alternate;
//         }
        
//         @keyframes glow {
//             from {
//                 text-shadow: 0 0 10px rgba(245, 158, 11, 0.5);
//             }
//             to {
//                 text-shadow: 0 0 20px rgba(245, 158, 11, 0.8), 0 0 30px rgba(245, 158, 11, 0.6);
//             }
//         }
//     </style>
// </head>
// <body>
//     <div class="background-pattern"></div>
//     <div class="notification-container">
//         <!-- Left Side with Logo and Title -->
//         <div class="left-side">
//             <div class="logo-container">
//                 ${logoUrl ? `<img src="${logoUrl}" class="logo-img" alt="Logo">` : '<span style="font-size: 50px; color: white;">💰</span>'}
//             </div>
//             <div class="tamil-title">பில் உருவாக்கப்பட்டது!</div>
//             <div class="english-title">New Payment Received</div>
//         </div>
        
//         <!-- Right Side with Details -->
//         <div class="right-side">
//             <div class="content-header">
//                 <h2 class="greeting">🎉 Congratulations! <span>You've earned commission</span></h2>
//                 <p class="message">A new payment has been successfully processed in your account</p>
//             </div>
            
//             <div class="amounts-container">
//                 <div class="amount-card total">
//                     <div class="card-label">
//                         <span class="icon">💰</span>
//                         Total Amount
//                     </div>
//                     <div class="card-value total">
//                         <span class="currency">₹</span>${amount.toLocaleString('en-IN')}
//                     </div>
//                 </div>
                
//                 <div class="amount-card commission">
//                     <div class="card-label">
//                         <span class="icon">💸</span>
//                         Your Commission
//                     </div>
//                     <div class="card-value commission glow">
//                         <span class="currency">₹</span>${commission.toLocaleString('en-IN')}
//                     </div>
//                 </div>
//             </div>
            
//             <div class="commission-highlight">
//                 <div class="commission-tamil">லாபம் பெற்றுள்ளீர்கள்!</div>
//                 <div class="commission-english">Profit Earned Successfully</div>
//             </div>
            
//             <div class="footer">
//                 <div class="customer-info">
//                     ${customerName ? `Customer: <span class="customer-name">${customerName}</span>` : 'Payment Received'}
//                 </div>
//                 <div class="date-time">
//                     <div class="time">${new Date().toLocaleDateString('en-IN', { 
//                         day: '2-digit',
//                         month: 'short',
//                         year: 'numeric'
//                     })} ${new Date().toLocaleTimeString('en-IN', { 
//                         hour: '2-digit',
//                         minute: '2-digit',
//                         hour12: true 
//                     })}</div>
//                     Keep up the great work!
//                 </div>
//             </div>
//         </div>
//     </div>
    
//     <!-- Icons as SVG for better rendering -->
//     <svg style="display: none;">
//         <symbol id="rupee-icon" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M13.66 7C13.1 5.82 11.9 5 10.5 5H6V3h12v2h-3.25v1.25H18v2h-2.25V11H18v2h-8v2.5h5.5v1.25H10.5V19H6v-2h4.5v-1.25H6V13.5h4.5v-5H7.5V7h6.16z"/>
//         </symbol>
//         <symbol id="commission-icon" viewBox="0 0 24 24">
//             <path fill="currentColor" d="M12,2A10,10 0 0,1 22,12A10,10 0 0,1 12,22A10,10 0 0,1 2,12A10,10 0 0,1 12,2M12,4A8,8 0 0,0 4,12A8,8 0 0,0 12,20A8,8 0 0,0 20,12A8,8 0 0,0 12,4M12,6A6,6 0 0,1 18,12A6,6 0 0,1 12,18A6,6 0 0,1 6,12A6,6 0 0,1 12,6Z"/>
//         </symbol>
//     </svg>
// </body>
// </html>
//     `;
//   }

//   async cleanupOldImages(maxAgeHours = 24): Promise<void> {
//     try {
//       const files = fs.readdirSync(this.uploadPath);
//       const now = Date.now();
//       const maxAgeMs = maxAgeHours * 60 * 60 * 1000;

//       for (const file of files) {
//         const filepath = path.join(this.uploadPath, file);
//         const stats = fs.statSync(filepath);
        
//         if (now - stats.mtimeMs > maxAgeMs) {
//           fs.unlinkSync(filepath);
//           this.logger.log(`Cleaned up old image: ${file}`);
//         }
//       }
//     } catch (error) {
//       this.logger.error('Failed to cleanup old images:', error);
//     }
//   }
// }