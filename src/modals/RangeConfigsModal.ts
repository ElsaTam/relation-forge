import { App, Modal, Setting } from "obsidian";
import { camelCaseToSentence, DEFAULT_RANGES, PropertyDescriptions, type ElementType, type PropertyMap, type PropertyTypes, type RangeConfiguration, type RelationAttribute, type RelationForgeSettings } from "src/internal";
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

        this.addRange("relation", "affinity", this.#settings.rangeProperties.affinity);
        this.addRange("relation", "frequency", this.#settings.rangeProperties.frequency);
        this.addRange("relation", "impact", this.#settings.rangeProperties.impact);
        this.addRange("relation", "influence", this.#settings.rangeProperties.influence);
        this.addRange("relation", "trust", this.#settings.rangeProperties.trust);

        new Setting(this.contentEl)
            .setName("Places")
            .setHeading();

        this.addRange("place", "placeImportance", this.#settings.rangeProperties.placeImportance);

        new Setting(this.contentEl)
            .setName("Events")
            .setHeading();

        this.addRange("event", "eventImportance", this.#settings.rangeProperties.eventImportance);

        new Setting(this.contentEl)
            .setName("Factions")
            .setHeading();

        this.addRange("faction", "power", this.#settings.rangeProperties.power);
    }

    private addRange<T extends ElementType>(element: T, property: PropertyTypes<T>, config: RangeConfiguration) {
        this.#inputs[element] = {};

        new Setting(this.contentEl)
            .setName(camelCaseToSentence(element))
            .setDesc(PropertyDescriptions[element][property] as string);

        const div = this.contentEl.createDiv({ cls: "range-settings" });

        for (const [key, value] of Object.entries(config)) {
            new Setting(div)
                .setName(camelCaseToSentence(key))
                .addText(cb => {
                    this.#inputs[element][key] = cb.inputEl;
                    cb.setValue(value.toString());
                    cb.onChange((v) => {
                        if (key === 'property') {
                            this.#settings.properties[element][property] = v as PropertyMap[T][keyof (typeof PropertyDescriptions)[T]];
                            this.#plugin.saveSettings();
                        }
                        else if (key === 'min' || key === 'max' || key === 'default') {
                            try {
                                this.#settings.rangeProperties[property as RelationAttribute][key] = parseInt(v);
                                this.#plugin.saveSettings();
                            }
                            catch {

                            }
                        }
                    })
                })
                .addExtraButton(cb => {
                    cb.setIcon('rotate-ccw');
                    cb.onClick(() => {
                        if (key === 'property') {
                            this.#settings.properties[element][property] = property.toString() as PropertyMap[T][keyof (typeof PropertyDescriptions)[T]];
                        }
                        else if (key === 'min' || key === 'max' || key === 'default') {
                            this.#settings.rangeProperties[property as RelationAttribute][key] = DEFAULT_RANGES[property as RelationAttribute][key];
                        }
                        this.#plugin.saveSettings();
                        this.#inputs[element][key.toString()].value = key.toString();
                    })
                });
        }
    }
}