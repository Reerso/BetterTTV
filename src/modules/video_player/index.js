const $ = require('jquery');
const watcher = require('../../watcher');
const settings = require('../../settings');
const keyCodes = require('../../utils/keycodes');

function handleKeyEvent(keyup) {
    if (keyup.ctrlKey || keyup.metaKey || keyup.shiftKey) return;
    if ($('input, textarea, select').is(':focus')) return;

    const $player = $('#player');
    if (!$player.length) return;

    switch (keyup.keyCode) {
        case keyCodes.k:
            $player.find('.js-control-playpause-button').click();
            break;
        case keyCodes.f:
            $player.find('.js-control-fullscreen').click();
            break;
        case keyCodes.m:
            $player.find('.player-button--volume').click();
            break;
    }
}

let clicks = 0;
function handlePlayerClick() {
    clicks++;
    setTimeout(() => {
        if (clicks === 1) {
            const $player = $('#player');
            const isPaused = $player.data('paused');
            const playerService = App.__container__.lookup('service:persistent-player');
            if (!playerService || !playerService.playerComponent || !playerService.playerComponent.player) return;
            if (!isPaused) playerService.playerComponent.player.pause();
        }
        clicks = 0;
    }, 250);
}

class VideoPlayerModule {
    constructor() {
        this.keybinds();
        watcher.on('load.channel', () => {
            this.viewerCount();
            this.clickToPause();
        });
        watcher.on('load.vod', () => this.clickToPause());
        settings.add({
            id: 'clickToPlay',
            name: 'Click to Play/Pause Stream',
            defaultValue: false,
            description: 'Click on the twitch player to pause/resume playback'
        });
        settings.on('changed.clickToPlay', () => this.clickToPause());
    }

    viewerCount() {
        try {
            const player = window.App && window.App.__container__.lookup('service:persistent-player');
            if (!player || !player.playerComponent || $('.player-viewer-count').length) return;

            $('div.player-streamstatus').append('<span class="player-viewer-count"></span>');
            player.playerComponent.addObserver('channel.stream.viewers', (model, key) => {
                const viewers = model.get(key);
                if (!viewers) return;
                $('.player-viewer-count').text(`${Number(viewers).toLocaleString()} viewers`);
            });
        } catch (e) {}
    }

    keybinds() {
        $(document).on('keyup.playerControls', handleKeyEvent);
    }

    clickToPause() {
        $('#player').off('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);

        if (settings.get('clickToPlay') === true) {
            $('#player').on('click', '.player-overlay.player-fullscreen-overlay', handlePlayerClick);
        }
    }
}

module.exports = new VideoPlayerModule();
