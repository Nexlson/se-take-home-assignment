// classes
class Order {
    constructor(orderNumber, customerType, status) {
        this.orderNumber = orderNumber;
        this.customerType = customerType;
        this.status = status;
    }
}

class WCDWorker {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
}

export { Order, WCDWorker }