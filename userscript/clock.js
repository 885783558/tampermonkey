// ==UserScript==
// @name         太空人表盘挂件
// @namespace    http://tampermonkey.net/
// @version      1.6
// @description  在网页显示太空人表盘，支持自由拖拽、等比缩放并记忆，带关闭按钮
// @author       You
// @match        *://*/*
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @connect      cdn.jsdelivr.net
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';

    // 须与 GitHub 仓库名一致；重命名仓库后只改这一处
    const REPO = '885783558/tampermonkey';
    const BASE_URL = 'https://cdn.jsdelivr.net/gh/' + REPO + '@main/';
    const ASSETS = BASE_URL + 'assets/clock/';
    const DEFAULT_SIZE = 280;
    const MIN_SIZE = 150;
    const MAX_SIZE = 600;

    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = ASSETS + 'css/style.css';
    document.head.appendChild(link);

    const script = document.createElement('script');
    script.src = ASSETS + 'js/timeGeneration.js';
    document.head.appendChild(script);

    script.onload = function() {
        initClock();
    };

    function initClock() {
        const container = document.createElement('div');
        container.id = 'jun-clock-container';
        container.innerHTML = `
            <div id="jun-clock-close" title="关闭表盘">✕</div>
            <div id="jun-clock-scale">
                <div class="jun-meter">
                    <div class="jun-time-h-h" id="hh"></div>
                    <div class="jun-time-h-l" id="hl"></div>
                    <div class="jun-time-rect"></div>
                    <div class="jun-human"></div>
                    <div class="jun-time-m-h" id="mh"></div>
                    <div class="jun-time-m-l" id="ml"></div>
                    <div class="jun-time-s-h" id="sh"></div>
                    <div class="jun-time-s-l" id="sl"></div>
                    <div class="jun-date" id="date"></div>
                    <div class="jun-calendar-date" id="calendarDate"></div>
                </div>
            </div>
            <div id="jun-clock-resize" title="拖动调整大小"></div>
        `;

        document.body.appendChild(container);

        const scaleWrapper = document.getElementById('jun-clock-scale');
        const closeBtn = document.getElementById('jun-clock-close');
        const resizeHandle = document.getElementById('jun-clock-resize');

        GM_addStyle(`
            #jun-clock-container {
                position: fixed !important;
                z-index: 2147483647 !important;
                pointer-events: auto !important;
                cursor: move !important;
                overflow: visible !important;
            }
            #jun-clock-scale {
                width: ${DEFAULT_SIZE}px !important;
                height: ${DEFAULT_SIZE}px !important;
                transform-origin: top left !important;
                pointer-events: none !important;
            }
            #jun-clock-scale .jun-meter {
                width: ${DEFAULT_SIZE}px !important;
                height: ${DEFAULT_SIZE}px !important;
            }
            #jun-clock-close {
                position: absolute !important;
                top: -10px !important;
                right: -10px !important;
                width: 24px !important;
                height: 24px !important;
                background: rgba(255, 0, 0, 0.8) !important;
                color: white !important;
                border-radius: 50% !important;
                display: flex !important;
                align-items: center !important;
                justify-content: center !important;
                cursor: pointer !important;
                font-size: 14px !important;
                font-weight: bold !important;
                z-index: 2147483647 !important;
                box-shadow: 0 2px 5px rgba(0,0,0,0.3) !important;
                transition: opacity 0.2s ease, transform 0.2s ease, background 0.2s ease !important;
                opacity: 0 !important;
                pointer-events: none !important;
            }
            #jun-clock-container:hover #jun-clock-close {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
            #jun-clock-close:hover {
                background: rgba(255, 0, 0, 1) !important;
                transform: scale(1.1) !important;
            }
            #jun-clock-resize {
                position: absolute !important;
                right: 2px !important;
                bottom: 2px !important;
                width: 18px !important;
                height: 18px !important;
                cursor: nwse-resize !important;
                z-index: 2147483647 !important;
                opacity: 0 !important;
                pointer-events: none !important;
                transition: opacity 0.2s ease !important;
                background: linear-gradient(135deg, transparent 50%, rgba(120, 120, 120, 0.85) 50%) !important;
                border-radius: 0 0 4px 0 !important;
            }
            #jun-clock-container:hover #jun-clock-resize {
                opacity: 1 !important;
                pointer-events: auto !important;
            }
        `);

        function applySize(size) {
            const normalizedSize = Math.max(MIN_SIZE, Math.min(MAX_SIZE, size));
            const scale = normalizedSize / DEFAULT_SIZE;
            container.style.width = normalizedSize + 'px';
            container.style.height = normalizedSize + 'px';
            scaleWrapper.style.transform = 'scale(' + scale + ')';
            return normalizedSize;
        }

        function saveSize() {
            GM_setValue('clock_size', {
                width: container.offsetWidth,
                height: container.offsetHeight
            });
        }

        const savedSize = GM_getValue('clock_size', null);
        if (savedSize && savedSize.width) {
            applySize(savedSize.width);
        } else {
            applySize(DEFAULT_SIZE);
        }

        const savedPos = GM_getValue('clock_position', null);
        if (savedPos) {
            container.style.left = savedPos.left;
            container.style.top = savedPos.top;
            container.style.right = 'auto';
            container.style.transform = 'none';
        } else {
            container.style.right = '20px';
            container.style.top = '50%';
            container.style.transform = 'translateY(-50%)';
        }

        let isDragging = false;
        let isResizing = false;
        let startX, startY, initialLeft, initialTop, initialSize;

        container.addEventListener('mousedown', function(e) {
            if (e.target.id === 'jun-clock-close' || e.target.id === 'jun-clock-resize') {
                return;
            }

            isDragging = true;
            startX = e.clientX;
            startY = e.clientY;

            const rect = container.getBoundingClientRect();
            initialLeft = rect.left;
            initialTop = rect.top;

            container.style.transform = 'none';
            container.style.right = 'auto';
            container.style.left = initialLeft + 'px';
            container.style.top = initialTop + 'px';

            document.body.style.userSelect = 'none';
        });

        resizeHandle.addEventListener('mousedown', function(e) {
            e.preventDefault();
            e.stopPropagation();

            isResizing = true;
            startX = e.clientX;
            startY = e.clientY;
            initialSize = container.offsetWidth;

            container.style.transform = 'none';
            container.style.right = 'auto';

            document.body.style.userSelect = 'none';
        });

        document.addEventListener('mousemove', function(e) {
            if (isResizing) {
                const delta = Math.max(e.clientX - startX, e.clientY - startY);
                applySize(initialSize + delta);
                return;
            }

            if (!isDragging) {
                return;
            }

            let newLeft = initialLeft + (e.clientX - startX);
            let newTop = initialTop + (e.clientY - startY);

            const maxLeft = window.innerWidth - container.offsetWidth;
            const maxTop = window.innerHeight - container.offsetHeight;

            newLeft = Math.max(0, Math.min(newLeft, maxLeft));
            newTop = Math.max(0, Math.min(newTop, maxTop));

            container.style.left = newLeft + 'px';
            container.style.top = newTop + 'px';
        });

        document.addEventListener('mouseup', function() {
            if (isResizing) {
                isResizing = false;
                document.body.style.userSelect = '';
                saveSize();
            }

            if (isDragging) {
                isDragging = false;
                document.body.style.userSelect = '';

                GM_setValue('clock_position', {
                    left: container.style.left,
                    top: container.style.top
                });
            }
        });

        closeBtn.addEventListener('click', function() {
            container.remove();
        });

        function WatchMeter() {
            this._initDom();
            this.update();
            this.date = new TimeGeneration();
        }

        WatchMeter.prototype = {
            constructor: WatchMeter,
            _initDom: function() {
                this.elem = {};
                this.elem.hh = document.getElementById('hh');
                this.elem.hl = document.getElementById('hl');
                this.elem.mh = document.getElementById('mh');
                this.elem.ml = document.getElementById('ml');
                this.elem.sh = document.getElementById('sh');
                this.elem.sl = document.getElementById('sl');
                this.elem.date = document.getElementById('date');
                this.elem.calendarDate = document.getElementById('calendarDate');
            },

            update: function() {
                var _this = this;
                setInterval(function() {
                    _this._render(_this.date.getDate(), _this.date.getCalendarDate(), _this.date.getTime());
                }, 1000);
            },

            _render: function(date, calendarDate, time) {
                this._setNumberImage(this.elem.hh, time[0]);
                this._setNumberImage(this.elem.hl, time[1]);
                this._setNumberImage(this.elem.mh, time[2]);
                this._setNumberImage(this.elem.ml, time[3]);
                this._setNumberImage(this.elem.sh, time[4]);
                this._setNumberImage(this.elem.sl, time[5]);
                this.elem.date.innerText = date[2] + " " + date[0] + "-" + date[1];
                this.elem.calendarDate.innerText = calendarDate;
            },
            _setNumberImage: function(elem, value) {
                elem.style.backgroundImage = "url(" + ASSETS + "img/" + value + ".svg)";
            }
        };

        new WatchMeter();
    }
})();
