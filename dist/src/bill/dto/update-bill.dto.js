"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateBillDto = void 0;
const swagger_1 = require("@nestjs/swagger");
const create_bill_dto_1 = require("./create-bill.dto");
class UpdateBillDto extends (0, swagger_1.PartialType)(create_bill_dto_1.CreateBillDto) {
}
exports.UpdateBillDto = UpdateBillDto;
//# sourceMappingURL=update-bill.dto.js.map