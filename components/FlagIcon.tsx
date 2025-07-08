import React from "react";

export const FlagIcon = ({ country }: { country: string }) => {
  switch (country) {
    case "CN":
      // 中国国旗
      return (
        <svg width="28" height="20" viewBox="0 0 28 20" fill="none" xmlns="http://www.w3.org/2000/svg">
          <rect width="28" height="20" fill="#DE2910"/>
          <polygon points="4,3 5,7 1,5 7,5 3,7" fill="#FFDE00"/>
          <polygon points="8,2 8.5,3 9.5,3 8.7,3.7 9,4.7 8,4.1 7,4.7 7.3,3.7 6.5,3 7.5,3" fill="#FFDE00" transform="translate(4,0) scale(0.4)"/>
          <polygon points="8,2 8.5,3 9.5,3 8.7,3.7 9,4.7 8,4.1 7,4.7 7.3,3.7 6.5,3 7.5,3" fill="#FFDE00" transform="translate(6,2) scale(0.4)"/>
          <polygon points="8,2 8.5,3 9.5,3 8.7,3.7 9,4.7 8,4.1 7,4.7 7.3,3.7 6.5,3 7.5,3" fill="#FFDE00" transform="translate(6,5) scale(0.4)"/>
          <polygon points="8,2 8.5,3 9.5,3 8.7,3.7 9,4.7 8,4.1 7,4.7 7.3,3.7 6.5,3 7.5,3" fill="#FFDE00" transform="translate(4,7) scale(0.4)"/>
        </svg>
      );
    case "EN":
      // 美国国旗（原SVG）
      return (
        <svg width="28" height="20" viewBox="0 0 38 30" fill="none" xmlns="http://www.w3.org/2000/svg">
          {<svg
                                      className="w-[28px] h-full"
                                      viewBox="0 0 38 30"
                                      fill="none"
                                      xmlns="http://www.w3.org/2000/svg"
                                    >
                                      <g filter="url(#filter0_d_34_25)">
                                        <g clipPath="url(#clip0_34_25)">
                                          <mask
                                            id="mask0_34_25"
                                            style={{ maskType: "luminance" }}
                                            maskUnits="userSpaceOnUse"
                                            x="3"
                                            y="1"
                                            width="32"
                                            height="24"
                                          >
                                            <rect
                                              x="3"
                                              y="1"
                                              width="32"
                                              height="24"
                                              fill="white"
                                            />
                                          </mask>
                                          <g mask="url(#mask0_34_25)">
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 1H35V25H3V1Z"
                                              fill="#F7FCFF"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 15.6666V17.6666H35V15.6666H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 19.3334V21.3334H35V19.3334H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 8.33337V10.3334H35V8.33337H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 23V25H35V23H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 12V14H35V12H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 1V3H35V1H3Z"
                                              fill="#E31D1C"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M3 4.66663V6.66663H35V4.66663H3Z"
                                              fill="#E31D1C"
                                            />
                                            <rect
                                              x="3"
                                              y="1"
                                              width="20"
                                              height="13"
                                              fill="#2E42A5"
                                            />
                                            <path
                                              fillRule="evenodd"
                                              clipRule="evenodd"
                                              d="M4.72221 3.93871L3.99633 4.44759L4.2414 3.54198L3.59668 2.96807H4.43877L4.7212 2.229L5.05237 2.96807H5.77022L5.20619 3.54198L5.42455 4.44759L4.72221 3.93871ZM8.72221 3.93871L7.99633 4.44759L8.2414 3.54198L7.59668 2.96807H8.43877L8.7212 2.229L9.05237 2.96807H9.77022L9.20619 3.54198L9.42455 4.44759L8.72221 3.93871ZM11.9963 4.44759L12.7222 3.93871L13.4245 4.44759L13.2062 3.54198L13.7702 2.96807H13.0524L12.7212 2.229L12.4388 2.96807H11.5967L12.2414 3.54198L11.9963 4.44759ZM16.7222 3.93871L15.9963 4.44759L16.2414 3.54198L15.5967 2.96807H16.4388L16.7212 2.229L17.0524 2.96807H17.7702L17.2062 3.54198L17.4245 4.44759L16.7222 3.93871ZM3.99633 8.44759L4.72221 7.93871L5.42455 8.44759L5.20619 7.54198L5.77022 6.96807H5.05237L4.7212 6.229L4.43877 6.96807H3.59668L4.2414 7.54198L3.99633 8.44759ZM8.72221 7.93871L7.99633 8.44759L8.2414 7.54198L7.59668 6.96807H8.43877L8.7212 6.229L9.05237 6.96807H9.77022L9.20619 7.54198L9.42455 8.44759L8.72221 7.93871ZM11.9963 8.44759L12.7222 7.93871L13.4245 8.44759L13.2062 7.54198L13.7702 6.96807H13.0524L12.7212 6.229L12.4388 6.96807H11.5967L12.2414 7.54198L11.9963 8.44759ZM16.7222 7.93871L15.9963 8.44759L16.2414 7.54198L15.5967 6.96807H16.4388L16.7212 6.229L17.0524 6.96807H17.7702L17.2062 7.54198L17.4245 8.44759L16.7222 7.93871ZM3.99633 12.4476L4.72221 11.9387L5.42455 12.4476L5.20619 11.542L5.77022 10.9681H5.05237L4.7212 10.229L4.43877 10.9681H3.59668L4.2414 11.542L3.99633 12.4476ZM8.72221 11.9387L7.99633 12.4476L8.2414 11.542L7.59668 10.9681H8.43877L8.7212 10.229L9.05237 10.9681H9.77022L9.20619 11.542L9.42455 12.4476L8.72221 11.9387ZM11.9963 12.4476L12.7222 11.9387L13.4245 12.4476L13.2062 11.542L13.7702 10.9681H13.0524L12.7212 10.229L12.4388 10.9681H11.5967L12.2414 11.542L11.9963 12.4476ZM16.7222 11.9387L15.9963 12.4476L16.2414 11.542L15.5967 10.9681H16.4388L16.7212 10.229L17.0524 10.9681H17.7702L17.2062 11.542L17.4245 12.4476L16.7222 11.9387ZM19.9963 4.44759L20.7222 3.93871L21.4245 4.44759L21.2062 3.54198L21.7702 2.96807H21.0524L20.7212 2.229L20.4388 2.96807H19.5967L20.2414 3.54198L19.9963 4.44759ZM20.7222 7.93871L19.9963 8.44759L20.2414 7.54198L19.5967 6.96807H20.4388L20.7212 6.229L21.0524 6.96807H21.7702L21.2062 7.54198L21.4245 8.44759L20.7222 7.93871ZM19.9963 12.4476L20.7222 11.9387L21.4245 12.4476L21.2062 11.542L21.7702 10.9681H21.0524L20.7212 10.229L20.4388 10.9681H19.5967L20.2414 11.542L19.9963 12.4476ZM6.72221 5.93871L5.99633 6.44759L6.2414 5.54198L5.59668 4.96807H6.43877L6.7212 4.229L7.05237 4.96807H7.77022L7.20619 5.54198L7.42455 6.44759L6.72221 5.93871ZM9.99633 6.44759L10.7222 5.93871L11.4245 6.44759L11.2062 5.54198L11.7702 4.96807H11.0524L10.7212 4.229L10.4388 4.96807H9.59668L10.2414 5.54198L9.99633 6.44759ZM14.7222 5.93871L13.9963 6.44759L14.2414 5.54198L13.5967 4.96807H14.4388L14.7212 4.229L15.0524 4.96807H15.7702L15.2062 5.54198L15.4245 6.44759L14.7222 5.93871ZM5.99633 10.4476L6.72221 9.93871L7.42455 10.4476L7.20619 9.54198L7.77022 8.96807H7.05237L6.7212 8.229L6.43877 8.96807H5.59668L6.2414 9.54198L5.99633 10.4476ZM10.7222 9.93871L9.99633 10.4476L10.2414 9.54198L9.59668 8.96807H10.4388L10.7212 8.229L11.0524 8.96807H11.7702L11.2062 9.54198L11.4245 10.4476L10.7222 9.93871ZM13.9963 10.4476L14.7222 9.93871L15.4245 10.4476L15.2062 9.54198L15.7702 8.96807H15.0524L14.7212 8.229L14.4388 8.96807H13.5967L14.2414 9.54198L13.9963 10.4476ZM18.7222 5.93871L17.9963 6.44759L18.2414 5.54198L17.5967 4.96807H18.4388L18.7212 4.229L19.0524 4.96807H19.7702L19.2062 5.54198L19.4245 6.44759L18.7222 5.93871ZM17.9963 10.4476L18.7222 9.93871L19.4245 10.4476L19.2062 9.54198L19.7702 8.96807H19.0524L18.7212 8.229L18.4388 8.96807H17.5967L18.2414 9.54198L17.9963 10.4476Z"
                                              fill="#F7FCFF"
                                            />
                                          </g>
                                          <rect
                                            x="3"
                                            y="1"
                                            width="32"
                                            height="24"
                                            fill="url(#paint0_linear_34_25)"
                                            style={{ mixBlendMode: "overlay" }}
                                          />
                                        </g>
                                        <rect
                                          x="3.5"
                                          y="1.5"
                                          width="31"
                                          height="23"
                                          rx="1.5"
                                          stroke="black"
                                          strokeOpacity="0.1"
                                          style={{ mixBlendMode: "multiply" }}
                                        />
                                      </g>
                                      <defs>
                                        <filter
                                          id="filter0_d_34_25"
                                          x="0"
                                          y="0"
                                          width="38"
                                          height="30"
                                          filterUnits="userSpaceOnUse"
                                          colorInterpolationFilters="sRGB"
                                        >
                                          <feFlood
                                            floodOpacity="0"
                                            result="BackgroundImageFix"
                                          />
                                          <feColorMatrix
                                            in="SourceAlpha"
                                            type="matrix"
                                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                                            result="hardAlpha"
                                          />
                                          <feOffset dy="2" />
                                          <feGaussianBlur stdDeviation="1.5" />
                                          <feColorMatrix
                                            type="matrix"
                                            values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.1 0"
                                          />
                                          <feBlend
                                            mode="normal"
                                            in2="BackgroundImageFix"
                                            result="effect1_dropShadow_34_25"
                                          />
                                          <feBlend
                                            mode="normal"
                                            in="SourceGraphic"
                                            in2="effect1_dropShadow_34_25"
                                            result="shape"
                                          />
                                        </filter>
                                        <linearGradient
                                          id="paint0_linear_34_25"
                                          x1="19"
                                          y1="1"
                                          x2="19"
                                          y2="25"
                                          gradientUnits="userSpaceOnUse"
                                        >
                                          <stop
                                            stopColor="white"
                                            stopOpacity="0.7"
                                          />
                                          <stop offset="1" stopOpacity="0.3" />
                                        </linearGradient>
                                        <clipPath id="clip0_34_25">
                                          <rect
                                            x="3"
                                            y="1"
                                            width="32"
                                            height="24"
                                            rx="2"
                                            fill="white"
                                          />
                                        </clipPath>
                                      </defs>
                                    </svg>}
        </svg>
      );
    // 你可以继续添加更多国家
    default:
      // 默认显示一个地球或问号
      return (
        <span role="img" aria-label="unknown">🌐</span>
      );
  }
};