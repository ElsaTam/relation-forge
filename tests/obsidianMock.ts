import { mock } from 'bun:test';
import Moment from 'moment';

class MockComponent { }
class MockMarkdownRenderChild { }
class MockModal { }
class MockNotice { }
class MockPluginSettingTab { }
class MockSetting { }

mock.module('obsidian', () => ({
	setIcon(iconEl: HTMLElement, iconName: string): void {
		// do nothing
	},
	getLinkpath(linktext: string): string {
		return "";
	},
	Component: MockComponent,
	MarkdownRenderChild: MockMarkdownRenderChild,
	Modal: MockModal,
	Notice: MockNotice,
	PluginSettingTab: MockPluginSettingTab,
	Setting: MockSetting,
	moment: Moment,
}));
