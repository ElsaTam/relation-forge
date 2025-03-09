import { App, PluginSettingTab, Setting } from 'obsidian';
import { RangeConfigsModal, type RelationForgeSettings } from 'src/internal';
import RelationForgePlugin from 'src/main';
import { TextConfigsModal } from 'src/modals/TextConfigsModal';

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
        this.stringConfigs();
    }

    private rangeConfigs() {
        new Setting(this.containerEl)
            .setName("Numeric properties")
            .setDesc("Choose the min, max, and default numeric values used by the different algorithms, as well as the name of the properties")
            .addExtraButton(cb => {
                cb.setIcon("sliders-horizontal");
                cb.onClick(() => {
                    const modal = new RangeConfigsModal(this.app, this.plugin, this.settings);
                    modal.open();
                });
            });
    }

    private stringConfigs() {
        new Setting(this.containerEl)
            .setName("Text properties")
            .setDesc("")
            .addExtraButton(cb => {
                cb.setIcon("case-sensitive");
                cb.onClick(() => {
                    const modal = new TextConfigsModal(this.app, this.plugin, this.settings);
                    modal.open();
                });
            });
    }
}