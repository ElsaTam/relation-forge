import { App, Modal, Setting } from "obsidian";
import { camelCaseToSentence, DEFAULT_RANGES, PropertyDescriptions, type ElementType, type PropertyMap, type PropertyTypes, type RelationAttribute, type RelationForgeSettings } from "src/internal";
import type RelationForgePlugin from "src/main";

export class TextConfigsModal extends Modal {
    #plugin: RelationForgePlugin;
    #settings: RelationForgeSettings;
    #inputs: Record<string, Record<string, HTMLInputElement>> = {};

    constructor(app: App, plugin: RelationForgePlugin, settings: RelationForgeSettings) {
        super(app);
        this.#plugin = plugin;
        this.#settings = settings;
        this.setTitle("Text properties");
        this.modalEl.addClass("forge-modal");
    }

    override onOpen() {
        this.contentEl.empty();

        new Setting(this.contentEl)
            .setDesc("Restart Obsidian after any change.");


        new Setting(this.contentEl)
            .setName("Characters")
            .setHeading();

        this.addProperty('character', 'description');
        this.addProperty('character', 'status');

        new Setting(this.contentEl)
            .setName("Events")
            .setHeading();

        this.addProperty('event', 'description');
        this.addProperty('event', 'eventImportance');

        new Setting(this.contentEl)
            .setName("Factions")
            .setHeading();

        this.addProperty('faction', 'description');

        new Setting(this.contentEl)
            .setName("Places")
            .setHeading();

        this.addProperty('place', 'description');
        this.addProperty('place', 'placeImportance');

        new Setting(this.contentEl)
            .setName("Relations")
            .setHeading();

        this.addProperty('relation', 'type');
        this.addProperty('relation', 'origin');
        this.addProperty('relation', 'role');
    }

    addProperty<T extends ElementType>(element: T, property: PropertyTypes<T>) {
        new Setting(this.contentEl)
            .setName(camelCaseToSentence(property.toString()))
            .setDesc(PropertyDescriptions[element][property] as string)
            .addText(cb => {
                if (!this.#inputs[element]) {
                    this.#inputs[element] = {};
                }
                this.#inputs[element][property.toString()] = cb.inputEl;
                cb.setValue(this.#settings.properties[element][property]);
                cb.onChange((value) => {
                    this.#settings.properties[element][property] = value as PropertyMap[T][keyof (typeof PropertyDescriptions)[T]];
                    this.#plugin.saveSettings();
                })
            })
            .addExtraButton(cb => {
                cb.setIcon('rotate-ccw');
                cb.onClick(() => {
                    this.#settings.properties[element][property] = property.toString() as PropertyMap[T][keyof (typeof PropertyDescriptions)[T]];
                    this.#plugin.saveSettings();
                    this.#inputs[element][property.toString()].value = property.toString();
                })
            })
    }
}