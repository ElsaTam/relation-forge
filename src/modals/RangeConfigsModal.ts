import { App, Modal, Setting } from "obsidian";
import { camelCaseToSentence, DEFAULT_RANGES, PropertyDescriptions, type RangeConfiguration, type RelationAttribute, type RelationForgeSettings } from "src/internal";
import type RelationForgePlugin from "src/main";

export class RangeConfigsModal extends Modal {
    #plugin: RelationForgePlugin;
    #settings: RelationForgeSettings;
    #inputs: Record<string, Record<string, HTMLInputElement>> = {};

    constructor(app: App, plugin: RelationForgePlugin, settings: RelationForgeSettings) {
        super(app);
        this.#plugin = plugin;
        this.#settings = settings;
        this.setTitle("Numeric properties");
        this.modalEl.addClass("forge-modal");
    }

    override onOpen() {
        this.contentEl.empty();

        new Setting(this.contentEl)
            .setDesc("Restart Obsidian after any change.");


        new Setting(this.contentEl)
            .setName("Relations")
            .setHeading();

        this.addRange("affinity", PropertyDescriptions.relations.affinity, this.#settings.ranges.affinity);
        this.addRange("frequency", PropertyDescriptions.relations.frequency, this.#settings.ranges.frequency);
        this.addRange("impact", PropertyDescriptions.relations.impact, this.#settings.ranges.impact);
        this.addRange("influence", PropertyDescriptions.relations.influence, this.#settings.ranges.influence);
        this.addRange("trust", PropertyDescriptions.relations.trust, this.#settings.ranges.trust);

        new Setting(this.contentEl)
            .setName("Places")
            .setHeading();

        this.addRange("placeImportance", PropertyDescriptions.places.importance, this.#settings.ranges.placeImportance);

        new Setting(this.contentEl)
            .setName("Events")
            .setHeading();

        this.addRange("eventImportance", PropertyDescriptions.events.importance, this.#settings.ranges.eventImportance);

        new Setting(this.contentEl)
            .setName("Factions")
            .setHeading();

        this.addRange("power", PropertyDescriptions.factions.power, this.#settings.ranges.power);
    }

    private addRange(type: RelationAttribute, description: string, config: RangeConfiguration) {
        this.#inputs[type] = {};

        new Setting(this.contentEl)
            .setName(camelCaseToSentence(type))
            .setDesc(description)
            .addExtraButton(cb => {
                cb.setIcon('rotate-ccw');
                cb.onClick(() => {
                    this.#settings.ranges[type] = DEFAULT_RANGES[type];
                    for (const [key, input] of Object.entries(this.#inputs[type])) {
                        input.value = this.#settings.ranges[type][key as 'property' | 'min' | 'max' | 'default'].toString();
                    }
                    this.#plugin.saveSettings();
                })
            });

        const div = this.contentEl.createDiv({ cls: "range-settings" });

        for (const [key, value] of Object.entries(config)) {
            new Setting(div)
                .setName(key)
                .addText(cb => {
                    this.#inputs[type][key] = cb.inputEl;
                    cb.setValue(value.toString());
                    cb.onChange((value) => {
                        if (key === 'property') {
                            this.#settings.ranges[type][key] = value;
                        }
                        else if (key === 'min' || key === 'max' || key === 'default') {
                            try {
                                this.#settings.ranges[type][key] = parseInt(value);
                                this.#plugin.saveSettings();
                            }
                            catch {

                            }
                        }
                    })
                });
        }
    }
}