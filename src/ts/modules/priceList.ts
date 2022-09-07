import { pricelistInstance } from "../main.js";

interface PricelistItemStateType {
    isAdded: boolean;
    hasVariants: boolean;
}

interface PricelistItemPropsType {
    id: string;
    name: string;
    time: string;
    price: number;
}

enum rs {
    Add = "Vybrat",
    Remove = "Odebrat"
}

export class Pricelist {
    itemElemets: Element[];
    headerElement: HTMLElement;
    previewElement: HTMLElement;
    previewItemsElement: HTMLElement;
    countElemets: Element[];
    finalPriceElements: Element[];
    itemsCount: number;
    finalPrice: number;
    itemsInstances: PricelistItem[];
    addedItems: PricelistItem[];

    constructor() {
        this.itemElemets = [...document.querySelectorAll("[data-pricelist-item]")];
        this.headerElement = document.querySelector("[data-pricelist-header]");
        this.previewElement = document.querySelector("[data-pricelist-preview]");
        this.previewItemsElement = this.previewElement.querySelector("[data-items]");
        this.countElemets = [...document.querySelectorAll("[data-pricelist-count]")];
        this.finalPriceElements = [...document.querySelectorAll("[data-pricelist-final-price]")];
        this.itemsCount = 0;
        this.finalPrice = 0;
        this.itemsInstances = [];
        this.addedItems = [];

        this.constructItems();
    };

    constructItems() {
        this.itemsInstances = this.itemElemets.map((item: HTMLElement) => {
            return new PricelistItem(item);
        });
    };

    getAddedItems() {
        this.addedItems = this.itemsInstances.filter((item: PricelistItem) => item.state.isAdded === true);
    };

    updateItemsCount() {
        this.itemsCount = this.addedItems.length;

        this.countElemets.forEach((item: HTMLElement) => {
            item.innerHTML = this.itemsCount.toString();
        });
    };

    updateFinalPrice() {
        const prices: number[] = this.addedItems.map((item: PricelistItem) => {
            return item.props.price;
        });

        this.finalPrice = 0;
        this.finalPrice = prices.reduce(
            (previousValue: number, currentValue: number) => previousValue + currentValue,
            this.finalPrice
        );

        this.finalPriceElements.forEach((item: HTMLElement) => {
            item.innerHTML = this.finalPrice.toString();
        });
    }

    updateHeader() {
        this.headerElement.innerHTML = this.addedItems.length.toString();
    };

    renderItemsPreview() {
        this.previewItemsElement.innerHTML = "";

        const itemsRaw = this.addedItems.map((item: PricelistItem) => {
            return `
                <div class='pricelist-preview-item'>
                    <div class='pricelist-preview-item-name'>${item.props.name}</div>
                    <div class='pricelist-preview-item-time'>${item.props.time}</div>
                    <div class='pricelist-preview-item-price'>${item.props.price} Kč</div>
                    <div class='pricelist-preview-item-remove'>
                        <a class='btn btn-dark' data-pricelist-preview-item data-id=${item.props.id}>Odebrat</a>
                    </div>
                </div>
            `;
        }).join('');

        this.previewItemsElement.innerHTML = itemsRaw;

        this.bindRemovePreviewItemMethod();
        this.updateItemsCount();
        this.updateFinalPrice();
    };

    bindRemovePreviewItemMethod() {
        document.querySelectorAll("[data-pricelist-preview-item]").forEach((item: HTMLElement) => {
            item.addEventListener("click", () => {
                const id = item.getAttribute("data-id");
                item.remove();
                this.removeAddedItemById(id);
            });
        });
    };

    removeAddedItemById(id: string) {
        const itemToBeRemoved = this.addedItems.find((item: PricelistItem) => item.props.id === id);
        itemToBeRemoved.removeItem();
    }
}

class PricelistItem {
    item: HTMLElement;
    chooseButton: HTMLElement;
    state: PricelistItemStateType;
    props: PricelistItemPropsType;

    constructor(_item: HTMLElement) {
        this.item = _item;
        this.chooseButton = this.item.querySelector("[data-choose]");
        this.state = {
            isAdded: false,
            hasVariants: false
        }
        this.props = {
            id: this.item.getAttribute("data-id") ?? Math.random().toString(),
            name: this.item.getAttribute("data-name"),
            time: this.item.getAttribute("data-time"),
            price: parseInt(this.item.getAttribute("data-price")),
        }
console.log(this.props)
        this.bindChooseButton();
    };

    bindChooseButton() {
        this.chooseButton.addEventListener("click", () => {
            if (this.state.isAdded === true) {
                return this.removeItem();
            }

            this.addItem();
        });
    };

    removeItem() {
        this.item.classList.remove("is-added");
        this.chooseButton.innerHTML = rs.Add;
        this.chooseButton.classList.add("btn-primary");
        this.chooseButton.classList.remove("btn-dark");
        this.state.isAdded = false;

        pricelistInstance.getAddedItems();
        pricelistInstance.updateHeader();
        pricelistInstance.renderItemsPreview();
    };

    addItem() {
        this.item.classList.add("is-added");
        this.chooseButton.innerHTML = rs.Remove;
        this.chooseButton.classList.remove("btn-primary");
        this.chooseButton.classList.add("btn-dark");
        this.state.isAdded = true;

        pricelistInstance.getAddedItems();
        pricelistInstance.updateHeader();
        pricelistInstance.renderItemsPreview();
    };
}