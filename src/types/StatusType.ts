export type StatusType = 'alive' | 'dead' | '';
export function asStatusType(str: string): StatusType {
	switch (str.toLowerCase()) {
		case 'alive': return 'alive';
		case 'dead': return 'dead';
		default: return '';
	}
}
