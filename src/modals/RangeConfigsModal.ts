import { App, Modal, Setting } from "obsidian";
import { DEFAULT_RANGES, RangeRegistry, type RelationAttribute, type RelationForgeSettings } from "src/internal";
import type RelationForgePlugin from "src/main";

export class RangeConfigsModal extends Modal {
    plugin: RelationForgePlugin;
    settings: RelationForgeSettings;

    constructor(app: App, plugin: RelationForgePlugin, settings: RelationForgeSettings) {
        super(app);
        this.plugin = plugin;
        this.settings = settings;
        this.setTitle("Range configurations")
    }

    override onOpen() {
        this.contentEl.empty();

        new Setting(this.contentEl)
            .setDesc("Restart Obsidian after any change.");

        const inputs: Record<string, Record<string, HTMLInputElement>> = {};

        for (let [type, config] of Object.entries(this.settings.ranges)) {
            const _type = type as RelationAttribute;
            inputs[_type] = {};

            new Setting(this.contentEl)
                .setName(type)
                .setHeading()
                .addExtraButton(cb => {
                    cb.setIcon('rotate-ccw');
                    cb.onClick(() => {
                        this.settings.ranges[_type] = DEFAULT_RANGES[_type];
                        for (const [key, input] of Object.entries(inputs[type])) {
                            input.value = this.settings.ranges[_type][key as 'property' | 'min' | 'max' | 'default'].toString();
                        }
                        this.plugin.saveSettings();
                    })
                });

            for (const [key, value] of Object.entries(config)) {
                new Setting(this.contentEl)
                    .setName(key)
                    .addText(cb => {
                        inputs[_type][key] = cb.inputEl;
                        cb.setValue(value.toString());
                        cb.onChange((value) => {
                            if (key === 'property') {
                                this.settings.ranges[_type][key] = value;
                            }
                            else if (key === 'min' || key === 'max' || key === 'default') {
                                try {
                                    this.settings.ranges[_type][key] = parseInt(value);
                                    this.plugin.saveSettings();
                                }
                                catch {

                                }
                            }
                        })
                    });
            }
        }
    }
}