export type AccTypRspType = {
  id: string;
  label: string;
  icon: string;
  is_active: boolean;
  is_system: boolean;
};

export type AccTypCreateReqType = {
  label: string;
  icon: string;
};

export type AccTypUpdateReqType = {
  id: string;
  label: string;
  icon: string;
};
