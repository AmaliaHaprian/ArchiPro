export interface Action {
    type: 'add' | 'update' | 'delete';
    data: any;
}