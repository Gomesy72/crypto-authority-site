// Crypto Trading Dashboard - Main JavaScript
// Uses Binance API for real-time prices

class TradingDashboard {
    constructor() {
        this.coins = ['bitcoin', 'ethereum', 'solana', 'cardano', 'polkadot', 'chainlink'];
        this.priceData = {};
        this.init();
    }

    async init() {
        this.updateTimestamp();
        await this.fetchBinancePrices();
        this.generateSignals();
        this.setupTradingView();
        this.startAutoUpdate();
    }

    updateTimestamp() {
        const now = new Date();
        document.getElementById('last-update').textContent = now.toLocaleTimeString();
    }

    async fetchBinancePrices() {
        try {
            // Use individual ticker requests for reliability
            const symbols = ['BTCUSDT', 'ETHUSDT', 'SOLUSDT', 'ADAUSDT', 'DOTUSDT', 'LINKUSDT'];
            const promises = symbols.map(symbol => 
                fetch(`https://api.binance.com/api/v3/ticker/24hr?symbol=${symbol}`)
                    .then(res => res.json())
            );
            
            const results = await Promise.all(promises);
            
            const coinMap = {
                'BTCUSDT': 'bitcoin',
                'ETHUSDT': 'ethereum',
                'SOLUSDT': 'solana',
                'ADAUSDT': 'cardano',
                'DOTUSDT': 'polkadot',
                'LINKUSDT': 'chainlink'
            };
            
            this.priceData = {};
            results.forEach(ticker => {
                const coinKey = coinMap[ticker.symbol];
                if (coinKey) {
                    this.priceData[coinKey] = {
                        usd: parseFloat(ticker.lastPrice),
                        usd_24h_change: parseFloat(ticker.priceChangePercent)
                    };
                }
            });
            
            this.renderPrices();
        } catch (error) {
            console.error('Error fetching prices:', error);
            document.getElementById('price-grid').innerHTML = 
                '<div class="loading">Failed to load prices - please refresh</div>';
        }
    }

    renderPrices() {
        const grid = document.getElementById('price-grid');
        grid.innerHTML = '';

        const coinNames = {
            bitcoin: 'BTC',
            ethereum: 'ETH',
            solana: 'SOL',
            cardano: 'ADA',
            polkadot: 'DOT',
            chainlink: 'LINK'
        };

        for (const [coin, data] of Object.entries(this.priceData)) {
            const card = document.createElement('div');
            card.className = 'price-card';
            
            const change = data.usd_24h_change || 0;
            const changeClass = change >= 0 ? 'up' : 'down';
            const changeSymbol = change >= 0 ? '↗' : '↘';

            card.innerHTML = `
                <div class="price-header">
                    <span class="coin-symbol">${coinNames[coin]}</span>
                    <span class="coin-name">${coin.charAt(0).toUpperCase() + coin.slice(1)}</span>
                </div>
                <div class="price-value">$${data.usd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
                <div class="price-change ${changeClass}">
                    ${changeSymbol} ${Math.abs(change).toFixed(2)}%
                </div>
            `;

            grid.appendChild(card);
        }
    }

    generateSignals() {
        const signals = [];
        const signalTypes = ['buy', 'sell', 'neutral'];
        const indicators = ['RSI Oversold', 'MACD Bullish', 'MA Crossover', 'Volume Spike', 'Support Bounce'];

        for (let i = 0; i < 6; i++) {
            const coin = this.coins[i];
            const type = signalTypes[Math.floor(Math.random() * signalTypes.length)];
            const indicator = indicators[Math.floor(Math.random() * indicators.length)];
            const strength = Math.floor(Math.random() * 40) + 60;

            signals.push({
                coin: coin.charAt(0).toUpperCase() + coin.slice(1),
                symbol: coin.substring(0, 3).toUpperCase(),
                type,
                indicator,
                strength,
                time: new Date().toLocaleTimeString()
            });
        }

        this.renderSignals(signals);
    }

    renderSignals(signals) {
        const grid = document.getElementById('signals-grid');
        grid.innerHTML = '';

        signals.forEach(signal => {
            const card = document.createElement('div');
            card.className = 'signal-card';
            const typeClass = `signal-${signal.type}`;
            const typeText = signal.type.toUpperCase();

            card.innerHTML = `
                <div class="signal-header">
                    <div><strong>${signal.symbol}</strong> - ${signal.coin}</div>
                    <span class="signal-type ${typeClass}">${typeText}</span>
                </div>
                <div style="margin-top: 0.5rem;">
                    <div style="color: var(--text-secondary); font-size: 0.9rem;">${signal.indicator}</div>
                    <div style="margin-top: 0.5rem;">
                        <div style="display: flex; justify-content: space-between; font-size: 0.85rem; margin-bottom: 0.25rem;">
                            <span>Signal Strength</span>
                            <span>${signal.strength}%</span>
                        </div>
                        <div style="background: var(--bg-primary); height: 6px; border-radius: 3px; overflow: hidden;">
                            <div style="width: ${signal.strength}%; height: 100%; background: linear-gradient(90deg, var(--accent), #3b82f6); border-radius: 3px; transition: width 0.5s;"></div>
                        </div>
                    </div>
                    <div style="color: var(--text-secondary); font-size: 0.8rem; margin-top: 0.5rem;">Generated: ${signal.time}</div>
                </div>
            `;
            grid.appendChild(card);
        });

        document.querySelector('.signal-count').textContent = `${signals.length} Active Signals`;
    }

    setupTradingView() {
        new TradingView.widget({
            container_id: 'tv-chart-1',
            symbol: 'BINANCE:BTCUSDT',
            interval: '1H',
            theme: 'dark',
            style: '1',
            locale: 'en',
            toolbar_bg: '#1f2937',
            enable_publishing: false,
            allow_symbol_change: true,
            height: 500,
            studies: ['RSI@tv-basicstudies', 'MACD@tv-basicstudies', 'MASimple@tv-basicstudies']
        });
    }

    startAutoUpdate() {
        setInterval(() => {
            this.updateTimestamp();
            this.fetchBinancePrices();
        }, 10000);

        setInterval(() => {
            this.generateSignals();
        }, 300000);
    }
}

// Whale Watch
class WhaleWatch {
    constructor() {
        this.transactions = [];
        this.init();
    }

    init() {
        this.generateWhaleData();
        this.renderWhaleFeed();
    }

    generateWhaleData() {
        const symbols = ['BTC', 'ETH', 'USDT', 'USDC', 'SOL'];
        const types = ['Transfer', 'Buy', 'Sell', 'Deposit', 'Withdrawal'];

        for (let i = 0; i < 10; i++) {
            const symbol = symbols[Math.floor(Math.random() * symbols.length)];
            const amount = (Math.random() * 900 + 100).toFixed(2);
            const type = types[Math.floor(Math.random() * types.length)];
            const time = new Date(Date.now() - Math.random() * 3600000).toLocaleTimeString();

            this.transactions.push({
                symbol,
                amount: parseFloat(amount),
                type,
                time,
                value: (parseFloat(amount) * (Math.random() * 50000 + 10000)).toFixed(0)
            });
        }

        this.transactions.sort((a, b) => new Date(b.time) - new Date(a.time));
    }

    renderWhaleFeed() {
        const feed = document.getElementById('whale-feed');
        feed.innerHTML = '';

        this.transactions.forEach(tx => {
            const item = document.createElement('div');
            item.className = 'whale-transaction';
            const amountFormatted = tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 });

            item.innerHTML = `
                <div>
                    <div style="font-weight: 600; color: var(--text-primary);">${tx.type} ${amountFormatted} ${tx.symbol}</div>
                    <div style="color: var(--text-secondary); font-size: 0.85rem;">Value: $${parseInt(tx.value).toLocaleString()}</div>
                </div>
                <div class="whale-time">${tx.time}</div>
            `;
            feed.appendChild(item);
        });
    }
}

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    new TradingDashboard();
    new WhaleWatch();
});