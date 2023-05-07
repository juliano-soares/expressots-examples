interface IUpdateUserRequestDTO {
    name: string;
    email: string;
}

interface IUpdateUserResponseDTO {
    id: string;
    name: string;
    email: string;
}

export { IUpdateUserRequestDTO, IUpdateUserResponseDTO };
