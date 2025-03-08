import { App, PluginSettingTab, Setting } from 'obsidian';
import { RangeConfigsModal, type RelationForgeSettings } from 'src/internal';
import RelationForgePlugin from 'src/main';

export class RelationForgeSettingTab extends PluginSettingTab {
    plugin: RelationForgePlugin;
    settings: RelationForgeSettings;

    constructor(app: App, plugin: RelationForgePlugin, settings: RelationForgeSettings) {
        super(app, plugin);
        this.plugin = plugin;
        this.settings = settings;
    }

    display(): void {
        this.containerEl.empty();

        this.rangeConfigs();
    }

    private rangeConfigs() {
        new Setting(this.containerEl)
            .setName("Range configurations")
            .addExtraButton(cb => {
                cb.setIcon("gear");
                cb.onClick(() => {
                    const modal = new RangeConfigsModal(this.app, this.plugin, this.settings);
                    modal.open();
                });
            })
    }
}