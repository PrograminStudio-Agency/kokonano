if(NOT TARGET hermes-engine::libhermes)
add_library(hermes-engine::libhermes SHARED IMPORTED)
set_target_properties(hermes-engine::libhermes PROPERTIES
    IMPORTED_LOCATION "/Users/leadingspark/.gradle/caches/8.10.2/transforms/6aa0db68c9b94695dedf8097d9ad5943/transformed/hermes-android-0.76.5-debug/prefab/modules/libhermes/libs/android.x86_64/libhermes.so"
    INTERFACE_INCLUDE_DIRECTORIES "/Users/leadingspark/.gradle/caches/8.10.2/transforms/6aa0db68c9b94695dedf8097d9ad5943/transformed/hermes-android-0.76.5-debug/prefab/modules/libhermes/include"
    INTERFACE_LINK_LIBRARIES ""
)
endif()
