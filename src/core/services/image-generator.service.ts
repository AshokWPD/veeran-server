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
    let browser: puppeteer.Browser | null = null;
    
    try {
      // Launch browser with optimized settings for server environment
      browser = await puppeteer.launch({
        headless: true, // Changed from 'new' to true for compatibility
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

  // Alternative method using system Chrome as fallback
  private async useHeadlessChromeDirectly(html: string, outputPath: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const { exec } = require('child_process');
      
      // Create temp HTML file
      const tempHtml = path.join('/tmp', `temp_${Date.now()}.html`);
      fs.writeFileSync(tempHtml, html);
      
      // Try different Chrome/Chromium commands
      const commands = [
        'google-chrome-stable --headless --disable-gpu --screenshot',
        'google-chrome --headless --disable-gpu --screenshot',
        'chromium-browser --headless --disable-gpu --screenshot',
        'chromium --headless --disable-gpu --screenshot'
      ];
      
      let commandIndex = 0;
      const tryCommand = () => {
        if (commandIndex >= commands.length) {
          reject(new Error('No Chrome/Chromium binary found'));
          return;
        }
        
        const command = `${commands[commandIndex]}="${outputPath}" --window-size=1024,512 "${tempHtml}"`;
        
        exec(command, { timeout: 30000 }, (error: Error, stdout: string, stderr: string) => {
          // Cleanup temp file
          if (fs.existsSync(tempHtml)) {
            fs.unlinkSync(tempHtml);
          }
          
          if (error) {
            this.logger.error(`Command ${commandIndex + 1} failed: ${stderr}`);
            commandIndex++;
            tryCommand();
          } else {
            this.logger.log(`Image generated with command ${commandIndex + 1}`);
            resolve();
          }
        });
      };
      
      tryCommand();
    });
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
        @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Tamil:wght@400;500;600;700;800;900&display=swap');
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Noto Sans Tamil', sans-serif;
            background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 50%, #ec4899 100%);
            width: 1024px;
            height: 512px;
            display: flex;
            justify-content: center;
            align-items: center;
        }
        
        .container {
            width: 1024px;
            height: 512px;
            background: white;
            display: flex;
            flex-direction: column;
            overflow: hidden;
        }
        
        /* Top Section - Logo & Shop Name */
        .top-section {
            background: linear-gradient(135deg, #1e40af 0%, #1e3a8a 100%);
            height: 90px;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 20px;
            border-bottom: 6px solid #fbbf24;
        }
        
        .logo-box {
            width: 60px;
            height: 60px;
            background: white;
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            border: 3px solid #fbbf24;
            box-shadow: 0 5px 15px rgba(0, 0, 0, 0.3);
        }
        
        .logo-box img {
            width: 45px;
            height: 45px;
            object-fit: contain;
        }
        
        .shop-title {
            font-size: 32px;
            font-weight: 900;
            color: white;
            text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.3);
        }
        
        /* Main Section - Amounts */
        .main-section {
            flex: 1;
            display: flex;
            height: 292px;
            padding: 40px 50px;
            gap: 40px;
        }
        
        /* Amount Cards */
        .amount-card {
            flex: 1;
            background: linear-gradient(135deg, #ffffff 0%, #f8fafc 100%);
            border-radius: 20px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15);
            border: 4px solid;
            position: relative;
            overflow: hidden;
        }
        
        .total-card {
            border-color: #3b82f6;
            background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
        }
        
        .profit-card {
            border-color: #10b981;
            background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
        }
        
        .amount-symbol {
            font-size: 60px;
            margin-bottom: 15px;
            width: 80px;
            height: 80px;
            background: white;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
            color: #374151;
            font-weight: bold;
        }
        
        .amount-label {
            font-size: 26px;
            font-weight: 800;
            color: #374151;
            margin-bottom: 20px;
            text-align: center;
        }
        
        .amount-value {
            font-size: 80px;
            font-weight: 900;
            color: #111827;
            line-height: 1;
            text-align: center;
        }
        
        .total-value {
            color: #1d4ed8;
        }
        
        .profit-value {
            color: #047857;
        }
        
        /* Bottom Section - Celebration Message */
        .bottom-section {
            background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);
            height: 130px;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            border-top: 6px solid #1e40af;
        }
        
        .celebration-text {
            font-size: 34px;
            font-weight: 900;
            color: #1e3a8a;
            text-shadow: 1px 1px 2px rgba(255, 255, 255, 0.5);
        }
        
        .sub-text {
            font-size: 22px;
            font-weight: 700;
            color: #78350f;
            margin-top: 8px;
        }
        
        /* Currency Symbol */
        .currency {
            font-size: 56px;
            vertical-align: top;
            margin-right: 8px;
        }
        
        /* Unicode Symbols for Money - Will render correctly */
        .money-symbol {
            font-family: Arial, sans-serif;
            font-size: 50px;
            font-weight: bold;
        }
        
        /* Animation */
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(20px); }
            to { opacity: 1; transform: translateY(0); }
        }
        
        .amount-card {
            animation: fadeIn 0.6s ease-out;
        }
        
        .profit-card {
            animation-delay: 0.3s;
            animation-fill-mode: both;
        }
        
        /* Glow effect for profit */
        @keyframes glow {
            0% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 0 20px rgba(16, 185, 129, 0.3); }
            50% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 0 40px rgba(16, 185, 129, 0.6); }
            100% { box-shadow: 0 15px 35px rgba(0, 0, 0, 0.15), 0 0 20px rgba(16, 185, 129, 0.3); }
        }
        
        .profit-card {
            animation: glow 2s infinite;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Top: Logo & Shop Name -->
        <div class="top-section">
            ${logoUrl ? `<div class="logo-box">
                <img src="${logoUrl}" alt="Logo">
            </div>` : '<div class="logo-box" style="background: linear-gradient(135deg, #fbbf24 0%, #f59e0b 100%);"><div class="money-symbol" style="color: white;">₹</div></div>'}
            <div class="shop-title">ஸ்ரீ வீரன் சேவை மையம்</div>
        </div>
        
        <!-- Middle: BIG Amounts Only -->
        <div class="main-section">
            <div class="amount-card total-card">
                <div class="amount-symbol" style="color: #1d4ed8;">₹</div>
                <div class="amount-label">மொத்த தொகை</div>
                <div class="amount-value total-value">
                    <span class="currency">₹</span>${amount.toLocaleString('ta-IN')}
                </div>
            </div>
            
            <div class="amount-card profit-card">
                <div class="amount-symbol" style="color: #047857;">↑</div>
                <div class="amount-label">உங்கள் லாபம்</div>
                <div class="amount-value profit-value">
                    <span class="currency">₹</span>${commission.toLocaleString('ta-IN')}
                </div>
            </div>
        </div>
        
        <!-- Bottom: Celebration Message -->
        <div class="bottom-section">
            <div class="celebration-text">★ லாபம் பெற்றுள்ளீர்கள்! வாழ்த்துக்கள்! ★</div>
            <div class="sub-text">◆ ஸ்ரீ மதுரை வீரன் துணை  ◆</div>
        </div>
    </div>
    
    <script>
        // Simple script to ensure content is fully loaded
        document.addEventListener('DOMContentLoaded', function() {
            // Force redraw to ensure animations work
            const cards = document.querySelectorAll('.amount-card');
            cards.forEach(card => {
                card.style.display = 'none';
                setTimeout(() => {
                    card.style.display = 'flex';
                }, 10);
            });
        });
    </script>
</body>
</html>
    `;
  }



















  
}

















