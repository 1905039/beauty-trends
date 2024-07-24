export class ProductObj
{
    public id: number = 0;
    public title: string = "";
    public rate: number = 0;
    public sales: number = 0;
    public price: number = 0;
    public discount: number = 0;
}

export class CartProductObj
{
    public id: number = 0;
    public product_id: number = 0;
    public name: string = "";
    public weight: number = 0.0;
    public quantity: number = 0;
    public price: number = 0;
}

export class CategoryObj
{
    public id: number = -1;
    public title: string = "";
    public parent: number = -1;
    public children: number[] = [];
}

export class OrderProductObj
{
    public id: number = 0;
    public total_price: number = 0;
}

export class ImageData
{
    public id: number = -1;
    public loaded: boolean = false;
    public data: string = "";
}

export class Review
{
    public id: number = -1;
    public rate: number = 0;
    public review: string = "";
}