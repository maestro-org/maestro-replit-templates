{ pkgs }: {
  deps = [
    pkgs.nodejs-18_x
    pkgs.nodePackages.npm
    pkgs.nodePackages.typescript-language-server
    pkgs.nodePackages.yarn
    pkgs.replitPackages.jest
  ];
}